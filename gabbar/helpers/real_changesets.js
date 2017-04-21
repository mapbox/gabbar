#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const argv = require('minimist')(process.argv.slice(2));
const parser = require('real-changesets-parser');
const queue = require('d3-queue').queue;

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
            });
        } else {
            console.log(JSON.stringify([]));
        }
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
        let url = `https://s3.amazonaws.com/mapbox/real-changesets/production/${changesetID}.json`
        request.get(url, (error, response, body) => {
            if (error || response.statusCode !== 200) return resolve({});
            else return resolve(JSON.parse(body));
        });
    });
}

function extract(realChangeset, callback) {
    callback(null, features);
}

function downloadUserDetails(userID) {
    return new Promise((resolve, reject) => {
        try {
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

function extractFeatures(realChangeset) {
    return new Promise((resolve, reject) => {
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');

        let userID = realChangeset.metadata.uid;
        downloadUserDetails(userID)
        .then(userDetails => {
            let features = {
                'changeset_id': realChangeset.metadata.id,
                'features_created': featuresCreated.length,
                'features_modified': featuresModified.length,
                'features_deleted': featuresDeleted.length,
                'user_id': userDetails.id,
                'user_name': userDetails.name,
                'user_first_edit': userDetails.first_edit,
                'user_changesets': userDetails.changeset_count,
                'user_features': userDetails.num_changes
            };
            resolve(features);
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
        features.user_features
    ];
}
