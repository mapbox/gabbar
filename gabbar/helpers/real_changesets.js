#!/usr/bin/env node
'use strict';

const request = require('request');
const argv = require('minimist')(process.argv.slice(2));
const parser = require('real-changesets-parser');
const turf = require('@turf/turf');
const _ = require('underscore');

module.exports = {
    downloadRealChangeset: downloadRealChangeset,
    extractFeatures: extractFeatures,
    formatFeatures: formatFeatures,
    getFeatureList: getFeatureList
};

if (argv.changesetID) {
    downloadRealChangeset(argv.changesetID)
    .then(realChangeset => {
        if (Object.keys(realChangeset).length > 0) {
            extractFeatures(realChangeset)
            .then(features => {
                // console.log(JSON.stringify(formatFeatures(features)));
                console.log(JSON.stringify(features));
            })
            .catch(error => {
                throw error;
            });
        } else {
            console.log(JSON.stringify([]));
        }
    })
    .catch(error => {
        throw error;
    });
}

let PRIMARY_TAGS = [
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

let CHANGESET_EDITORS = [
    'iD',
    'JOSM',
    'MAPS.ME',
    'Potlatch',
    'Redaction bot',
    'Vespucci',
    'OsmAnd',
    'Merkaartor',
    'gnome', // For amishas157! :wave:
    'other'
];
let CHANGESET_EDITOR_PREFIX = 'changeset_editor_';


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

function downloadRealChangeset(changesetID) {
    return new Promise((resolve, reject) => {
        let url = `https://s3.amazonaws.com/mapbox/real-changesets/production/${changesetID}.json`;
        request.get(url, (error, response, body) => {
            if (error || response.statusCode !== 200) return resolve({});
            else return resolve(JSON.parse(body));
        });
    });
}

function downloadUserDetails(userID, userDetails) {
    return new Promise((resolve, reject) => {
        try {
            // If user exists in userDetails, don't do an API request.
            if (userDetails && (userID in userDetails)) return resolve(userDetails[userID]);

            let url = 'https://osm-comments-api.mapbox.com/api/v1/users/id/' + userID;
            request.get(url, (error, response, body) => {
                if (error || response.statusCode !== 200) return resolve({});
                else return resolve(JSON.parse(body));
            });
        } catch (error) {
            return resolve({});
        }
    });
}

function getBBOXArea(realChangeset) {
    let meta = realChangeset['metadata'];
    let bbox = [meta['min_lat'], meta['min_lon'], meta['max_lat'], meta['max_lon']].map(parseFloat);
    var polygon = turf.bboxPolygon(bbox);
    return parseFloat(turf.area(polygon).toFixed(4));
}

function getChangesetEditor(realChangeset) {
    let changesetEditor = '';

    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'created_by') {
            changesetEditor = tag['v'];
            break;
        }
    }
    for (let editor of CHANGESET_EDITORS) {
        if (changesetEditor.indexOf(editor) !== -1) return editor;
    }
    // The changeset editor does not match with any in the list.
    return 'other';
}

function getChangesetEditorCounts(realChangeset) {
    let changesetEditor = '';
    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'created_by') {
            changesetEditor = tag['v'];
            break;
        }
    }

    let editors = [];
    for (let i = 0; i < CHANGESET_EDITORS.length; i++) {
        let editor = CHANGESET_EDITORS[i];
        if (changesetEditor.indexOf(editor) !== -1) editors.push(1);
        else editors.push(0);
    }
    // Set changeset if no other editor has a count of 1.
    let sum = editors.reduce((a, b) => a + b);
    if (sum === 0) editors[editors.length - 1] += 1;

    return editors;
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

function getPrimaryTags(feature) {
    let primaryTags = [];
    for (var tag in feature.properties.tags) {
        if (PRIMARY_TAGS.indexOf(tag) !== -1) primaryTags.push(tag);
    }
    return primaryTags;
}

function getPrimaryTagCounts(features) {
    let counts = {};
    for (let version of features) {
        for (let primaryTag of getPrimaryTags(version[0])) {
            if (!(primaryTag in counts)) counts[primaryTag] = 0;
            counts[primaryTag] += 1;
        }
    }
    return counts;
}

function getFeatureVersionCounts(features) {
    let counts = {
        new: 0,     // version == 1
        low: 0,     // version <= 5
        medium: 0,  // version <= 10
        high: 0     // version > 10
    };
    for (let version of features) {
        let newVersion = version[0];
        let featureVersion = parseInt(newVersion.properties.version);

        if (featureVersion === 1) {
            counts.new += 1;
        } else if ((featureVersion > 1) && (featureVersion <= 5)) {
            counts.low += 1;
        } else if ((featureVersion > 5) && (featureVersion <= 10)) {
            counts.medium += 1;
        } else {
            counts.high += 1;
        }
    }
    return counts;
}

function datetimeToInteger(dt) {
    return Math.floor(new Date(dt) / 1000);
}

function extractFeatures(realChangeset, userDetails) {
    return new Promise((resolve, reject) => {
        let changeset = parser(realChangeset);

        // Real changeset based features.
        let bboxArea = getBBOXArea(realChangeset);
        let changesetEditor = getChangesetEditor(realChangeset);
        let editorCounts = getChangesetEditorCounts(realChangeset);

        // Processed changeset based features.
        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');

        let allFeatures = featuresCreated.concat(featuresModified, featuresDeleted);
        let featureTypeCounts = getFeatureTypeCounts(allFeatures);
        let primaryTagCounts = getPrimaryTagCounts(allFeatures);
        let featureVersionCounts = getFeatureVersionCounts(allFeatures);

        let userID = realChangeset.metadata.uid;
        downloadUserDetails(userID, userDetails)
        .then(userDetail => {
            let features = {
                'changeset_id': realChangeset.metadata.id,
                'features_created': featuresCreated.length,
                'features_modified': featuresModified.length,
                'features_deleted': featuresDeleted.length,
                'user_id': userDetail.id,
                'user_name': userDetail.name,
                'user_first_edit': String(datetimeToInteger(userDetail.first_edit)),
                'user_changesets': userDetail.changeset_count,
                'user_features': userDetail.num_changes,
                'bbox_area': bboxArea,
                'changeset_editor': changesetEditor,
                'node_count': featureTypeCounts['node'],
                'way_count': featureTypeCounts['way'],
                'relation_count': featureTypeCounts['relation'],
                'property_modifications': getPropertyModifications(featuresModified).length,
                'geometry_modifications': getGeometryModifications(featuresModified).length,
                'feature_version_new': featureVersionCounts.new,
                'feature_version_low': featureVersionCounts.low,
                'feature_version_medium': featureVersionCounts.medium,
                'feature_version_high': featureVersionCounts.high
            };

            for (let editor of CHANGESET_EDITORS) {
                features[CHANGESET_EDITOR_PREFIX + editor] = editorCounts[CHANGESET_EDITORS.indexOf(editor)];
            }

            // Concat primary tag counts.
            for (let primaryTag of PRIMARY_TAGS) {
                features[primaryTag] = primaryTag in primaryTagCounts ? primaryTagCounts[primaryTag] : 0;
            }

            resolve(features);
        })
        .catch(error => {
            throw error;
        });
    });
}

function getFeatureList() {
    let features = [
        'changeset_id',
        'features_created',
        'features_modified',
        'features_deleted',
        'user_id',
        'user_name',
        'user_first_edit',
        'user_changesets',
        'user_features',
        'bbox_area',
        'changeset_editor',
        'node_count',
        'way_count',
        'relation_count',
        'property_modifications',
        'geometry_modifications',
        'feature_version_new',
        'feature_version_low',
        'feature_version_medium',
        'feature_version_high'
    ];

    for (let editor of CHANGESET_EDITORS) features.push(CHANGESET_EDITOR_PREFIX + editor);
    for (let primaryTag of PRIMARY_TAGS) features.push(primaryTag);

    return features;
}

function formatFeatures(features) {
    let featureList = getFeatureList();

    let formatted = [];
    for (let feature of featureList) {
        formatted.push(features[feature]);
    }
    return formatted;
}
