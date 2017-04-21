#!/usr/bin/env node
'use strict';

const request = require('request');
const argv = require('minimist')(process.argv.slice(2));
const parser = require('real-changesets-parser');
const turf = require('@turf/turf');

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

function extractFeatures(realChangeset, userDetails) {
    return new Promise((resolve, reject) => {
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');
        let bboxArea = getBBOXArea(realChangeset);
        let changesetEditor = getChangesetEditor(realChangeset);

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
                'changeset_editor': changesetEditor
            };
            resolve(features);
        })
        .catch(error => {
            throw error;
        });
    });
}

function formatFeatures(features) {
    return [
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
        features.changeset_editor
    ];
}
