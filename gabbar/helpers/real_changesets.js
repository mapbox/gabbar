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
    formatFeatures: formatFeatures
};

if (argv.changesetID) {
    downloadRealChangeset(argv.changesetID)
    .then(realChangeset => {
        if (Object.keys(realChangeset).length > 0) {
            extractFeatures(realChangeset)
            .then(features => {
                console.log(JSON.stringify(formatFeatures(features)));
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
    // Adding GNOME for amishas157! :wave:
    let editors = ['iD', 'JOSM', 'MAPS.ME', 'Potlatch', 'Redaction bot', 'Vespucci', 'OsmAnd', 'Merkaartor', 'gnome'];
    for (let editor of editors) {
        if (changesetEditor.indexOf(editor) !== -1) return editor;
    }
    // The changeset editor does not match with any in the list.
    return 'other';
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

function extractFeatures(realChangeset, userDetails) {
    return new Promise((resolve, reject) => {
        let changeset = parser(realChangeset);

        // Real changeset based features.
        let bboxArea = getBBOXArea(realChangeset);
        let changesetEditor = getChangesetEditor(realChangeset);

        // Processed changeset based features.
        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');

        let allFeatures = featuresCreated.concat(featuresModified, featuresDeleted);
        let featureTypeCounts = getFeatureTypeCounts(allFeatures);
        let primaryTagCounts = getPrimaryTagCounts(allFeatures);

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
                'user_first_edit': userDetail.first_edit,
                'user_changesets': userDetail.changeset_count,
                'user_features': userDetail.num_changes,
                'bbox_area': bboxArea,
                'changeset_editor': changesetEditor,
                'node_count': featureTypeCounts['node'],
                'way_count': featureTypeCounts['way'],
                'relation_count': featureTypeCounts['relation'],
                'property_modifications': getPropertyModifications(featuresModified).length,
                'geometry_modifications': getGeometryModifications(featuresModified).length
            };

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

function formatFeatures(features) {
    let formatted = [
        features.changeset_id,
        features.features_created,
        features.features_modified,
        features.features_deleted,
        features.user_id,
        features.user_name,
        features.user_first_edit,
        features.user_changesets,
        features.user_features,
        features.bbox_area,
        features.changeset_editor,
        features.node_count,
        features.way_count,
        features.relation_count,
        features.property_modifications,
        features.geometry_modifications
    ];
    for (let primaryTag of PRIMARY_TAGS) {
        formatted.push(features[primaryTag]);
    }
    return formatted;
}
