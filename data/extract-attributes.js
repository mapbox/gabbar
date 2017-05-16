'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const turf = require('@turf/turf');
const parser = require('real-changesets-parser');
const _ = require('underscore');

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
        if (specials.indexOf(s) !== -1) count += 1;
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
        ];
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
    ]
    console.log(header.join(','));
    let features = [];

    let q = queue();

    // Starting from the second row, skipping the header.
    for (var i = 1; i < changesets.length; i++) {
        let changeset = changesets[i];
        q.defer(extractFeatures, changeset, argv.realChangesets, argv.userDetails);
    }
});
