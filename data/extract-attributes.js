'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const turf = require('@turf/turf');
const parser = require('real-changesets-parser');
const _ = require('underscore');
const nullIslandCF = require('@mapbox/osm-compare/comparators/null_island.js');
const addedPlaceCF = require('@mapbox/osm-compare/comparators/added_place.js');
const commonTagValuesCF = require('@mapbox/osm-compare/comparators/common_tag_values.js');
const draggedHighwayWaterwayCF = require('@mapbox/osm-compare/comparators/dragged_highway_waterway.js');
const largeBuildingCF = require('@mapbox/osm-compare/comparators/large_building.js');
const majorNameModificationCF = require('@mapbox/osm-compare/comparators/major_name_modification.js');
const majorRoadChangedCF = require('@mapbox/osm-compare/comparators/major_road_changed.js');

if (!argv.changesets || !argv.realChangesets || !argv.userDetails) {
    console.log('');
    console.log('USAGE: node extract-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets       changesets.csv      Changesets dump from osmcha');
    console.log('    --realChangesets   real-changesets/    Directory with real changesets');
    console.log('    --userDetails      user-details/       Directory with user details');
    console.log('');
    process.exit(0);
}

let EDITORS = [
    'iD',
    'JOSM',
    'MAPS.ME',
    'Potlatch',
    'Redaction',
    'Vespucci',
    'OsmAnd',
    'Merkaartor',
    'GNOME'  // For amishas157! :wave:
];

var PRIMARY_TAGS = [
    'aerialway',
    'aeroway',
    'amenity',
    'barrier',
    'boundary',
    'building',
    'craft',
    'emergency',
    'geological',
    'highway',
    'historic',
    'landuse',
    'leisure',
    'man_made',
    'military',
    'natural',
    'office',
    'place',
    'power',
    'public_transport',
    'railway',
    'route',
    'shop',
    'sport',
    'tourism',
    'waterway'
];

function getChangesetEditor(realChangeset) {
    let changesetEditor = '';

    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'created_by') {
            changesetEditor = tag['v'];
            break;
        }
    }
    for (let editor of EDITORS) {
        if (changesetEditor.indexOf(editor) !== -1) return editor;
    }
    // The changeset editor does not match with any in the list.
    return 'other';
}

function processChangesetEditor(changesetEditor) {
    changesetEditor = changesetEditor.toLowerCase();
    for (var i = 0; i < EDITORS.length; i++) {
        if (changesetEditor.indexOf(EDITORS[i].toLowerCase()) !== -1) return i;
    }
    return EDITORS.length;
}

function getBBOXArea(realChangeset) {
    let meta = realChangeset['metadata'];
    let bbox = [meta['min_lat'], meta['min_lon'], meta['max_lat'], meta['max_lon']].map(parseFloat);
    var polygon = turf.bboxPolygon(bbox);
    return parseInt(turf.area(polygon));
}

function getNewAndOldVersion(changeset, touchedFeature) {
    var versions = [];
    for (var feature of changeset.features) {
        if (feature.properties.id === touchedFeature.properties.id) versions.push(feature);
    }
    // There is only one occourances for features that are newly created.
    if (versions.length === 1) return versions;

    if (versions[0].properties.version > versions[1].properties.version) return [versions[0], versions[1]];
    else return [versions[1], versions[0]];
}

function getFeaturesByAction(changeset, action) {
    let features = [];
    let seen = [];
    for (let feature of changeset.features) {
        let featureID = feature.properties.id;
        if ((feature.properties.action === action) && (seen.indexOf(featureID) === -1)) {
            features.push(getNewAndOldVersion(changeset, feature));
            seen.push(featureID);
        }
    }
    return features;
}

function getFeatureTypeCounts(features) {
    let counts = {
        node: 0,
        way: 0,
        relation: 0
    };
    for (var version of features) {
        var newVersion = version[0];
        var featureType = newVersion.properties.type;
        counts[featureType] += 1;
    }
    return counts;
}

function getPropertyModifications(features) {
    let modifications = [];
    for (let versions of features) {
        let newVersion = versions[0];
        let oldVersion = versions[1];
        if (!(_.isEqual(newVersion.properties.tags, oldVersion.properties.tags))) modifications.push(versions);
    }
    return modifications;
}

function getGeometryModifications(features) {
    let modifications = [];
    for (let versions of features) {
        let newVersion = versions[0];
        let oldVersion = versions[1];
        if (JSON.stringify(newVersion.geometry) !== JSON.stringify(oldVersion.geometry)) modifications.push(versions);
    }
    return modifications;
}

function getChangesetComment(realChangeset) {
    let comment = '';

    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'comment') {
            comment = tag['v'];
            break;
        }
    }
    return comment;
}

function getChangesetImageryUsed(realChangeset) {
    let imageryUsed = '';

    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'imagery_used') {
            imageryUsed = tag['v'];
            break;
        }
    }
    return imageryUsed;
}

function getSpecialCharacterCount(s) {
    let count = 0;
    let specials = '0123456789~`!#$%^&*+=-[]\\\';,/{}|\":<>?';
    for (let character of s) {
        if (specials.indexOf(character) !== -1) count += 1;
    }
    return count;
}

function getPrimaryTags(feature) {
    let primaryTags = [];
    for (var tag in feature.properties.tags) {
        if (PRIMARY_TAGS.indexOf(tag) !== -1) primaryTags.push(tag);
    }
    return primaryTags;
}

function getPrimaryTagActionCounts(features) {
    let counts = {
        'created': 0,
        'modified': 0,
        'deleted': 0
    }
    for (let versions of features) {
        let newVersion = versions[0];
        let action = newVersion.properties.action;
        if (action === 'create') counts['created'] += getPrimaryTags(newVersion).length;
        if (action === 'delete') counts['deleted'] += getPrimaryTags(newVersion).length;
        if (action == 'modify') {
            let newTags = newVersion.properties.tags;
            let newPrimaryTags = getPrimaryTags(newVersion);

            let oldVersion = versions[1];
            let oldTags = oldVersion.properties.tags;
            let oldPrimaryTags = getPrimaryTags(oldVersion);

            for (let newPrimaryTag of newPrimaryTags) {
                if (oldPrimaryTags.indexOf(newPrimaryTag) === -1) counts['created'] += 1;
                else if (newTags[newPrimaryTag] !== oldTags[newPrimaryTag]) counts['modified'] += 1;
            }

            for (let oldPrimaryTag of oldPrimaryTags) {
                if (newPrimaryTags.indexOf(oldPrimaryTag) === -1) counts['created'] += 1;
                // Modifications are previously checked ^
                // else if (newTags[oldPrimaryTag] !== oldTags[oldPrimaryTag]) counts['modified'] += 1;
            }
        }
    }
    return counts;
}

function getPrimaryTagCounts(features) {
    let counts = {};
    for (let version of features) {
        let primaryTags = getPrimaryTags(version[0]);
        for (let primaryTag of primaryTags) {
            if (!(primaryTag in counts)) counts[primaryTag] = 0;
            counts[primaryTag] += 1;
        }
    }
    return counts;
}

function mergeTagsIntoProperties(features) {
    let mergedFeatures = [];
    for (let versions of features) {
        let newVersion = versions[0];
        let oldVersion = versions[1];

        if (newVersion && (Object.keys(newVersion.properties.tags).length > 0)) {
            newVersion.properties = Object.assign(newVersion.properties, newVersion.properties.tags);
        }
        if (oldVersion && (Object.keys(oldVersion.properties.tags).length > 0)) {
            oldVersion.properties = Object.assign(oldVersion.properties, oldVersion.properties.tags);
        }
        mergedFeatures.push([newVersion, oldVersion]);
    }
    return mergedFeatures;
}

function typeACompareFunction(compareFunction, features) {
    let count = 0;
    let result;
    for (let feature of features) {
        result = compareFunction(feature[0], feature[1]);
        if (result) count += 1;
    }
    return count;
}

function extractFeatures(row, realChangesetsDir, userDetailsDir, callback) {
    try {
        let changesetID = row[0];
        let changesetPath = path.join(realChangesetsDir, changesetID + '.json');
        let realChangeset = JSON.parse(fs.readFileSync(changesetPath));
        let changeset = parser(realChangeset);

        let changesetComment = getChangesetComment(realChangeset);
        let changesetImageryUsed = getChangesetImageryUsed(realChangeset);

        let userName = row[1];
        let specialCharacterCount = getSpecialCharacterCount(userName);
        let userDetailsPath = path.join(userDetailsDir, userName + '.json');
        let userDetails = JSON.parse(fs.readFileSync(userDetailsPath));

        // Processed changeset based features.
        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');

        let allFeatures = featuresCreated.concat(featuresModified, featuresDeleted);
        let featureTypeCounts = getFeatureTypeCounts(allFeatures);
        let primaryTagActionCounts = getPrimaryTagActionCounts(allFeatures);
        let primaryTagCounts = getPrimaryTagCounts(allFeatures);

        let allFeaturesMerged = mergeTagsIntoProperties(allFeatures);

        let attributes = [
            changesetID,
            row[15],
            processChangesetEditor(getChangesetEditor(realChangeset)),
            getBBOXArea(realChangeset),
            allFeatures.length,
            featuresCreated.length,
            featuresModified.length,
            featuresDeleted.length,
            featureTypeCounts['node'],
            featureTypeCounts['way'],
            featureTypeCounts['relation'],
            getPropertyModifications(featuresModified).length,
            getGeometryModifications(featuresModified).length,
            userDetails['changeset_count'],
            userDetails['num_changes'],
            userDetails['extra']['mapping_days'],
            userDetails['extra']['total_discussions'],
            userDetails['extra']['changesets_with_discussions'],
            changesetComment.length > 0 ? 1 : 0,
            changesetComment.length > 0 ? changesetComment.split(' ').length : 0,
            changesetImageryUsed.length > 0 ? 1 : 0,
            specialCharacterCount,
            primaryTagActionCounts['created'],
            primaryTagActionCounts['modified'],
            primaryTagActionCounts['deleted'],
            typeACompareFunction(nullIslandCF, allFeaturesMerged),
            typeACompareFunction(addedPlaceCF, allFeaturesMerged),
            typeACompareFunction(commonTagValuesCF, allFeaturesMerged),
            typeACompareFunction(draggedHighwayWaterwayCF, allFeaturesMerged),
            typeACompareFunction(largeBuildingCF, allFeaturesMerged),
            typeACompareFunction(majorNameModificationCF, allFeaturesMerged),
            typeACompareFunction(majorRoadChangedCF, allFeaturesMerged),
        ];

        // Concat primary tag counts.
        for (let primaryTag of PRIMARY_TAGS) {
            attributes.push(primaryTag in primaryTagCounts ? primaryTagCounts[primaryTag] : 0);
        }

        console.log(attributes.join(','));
        return callback();
    } catch(error) {
        // NOTE: Skipping on error for now.
        return callback();
    }
}

csv.parse(fs.readFileSync(argv.changesets), (error, changesets) => {
    let header = [
        'changeset_id',
        'harmful',
        'changeset_editor',
        'bbox_area',
        'features_total',
        'features_created',
        'features_modified',
        'features_deleted',
        'features_node',
        'features_way',
        'features_relation',
        'features_modified_property',
        'features_modified_geometry',
        'user_changesets',
        'user_features',
        'user_mapping_days',
        'user_discussions',
        'user_changesets_with_discussions',
        'has_changeset_comment',
        'changeset_comment_words',
        'has_changeset_imagery_used',
        'user_name_special_characters',
        'primary_tags_created',
        'primary_tags_modified',
        'primary_tags_deleted',
        'cf_null_island',
        'cf_added_place',
        'cf_common_tag_values',
        'cf_dragged_highway_waterway',
        'cf_large_building',
        'cf_major_name_modification',
        'cf_major_road_changed',
    ]
    for (let primaryTag of PRIMARY_TAGS) header.push(primaryTag);
    console.log(header.join(','));
    let features = [];

    let q = queue();

    // Starting from the second row, skipping the header.
    for (var i = 1; i < changesets.length; i++) {
        let changeset = changesets[i];
        q.defer(extractFeatures, changeset, argv.realChangesets, argv.userDetails);
    }
});
