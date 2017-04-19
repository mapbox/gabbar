#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const request = require('request');
const argv = require('minimist')(process.argv.slice(2));
const parser = require('real-changesets-parser');
const queue = require('d3-queue').queue;

module.exports = {
    extractFeatures: extractFeatures,
    downloadRealChangeset: downloadRealChangeset
};

if (argv.changesetID) {
    downloadRealChangeset(argv.changesetID)
    .then(realChangeset => {
        extractFeatures(realChangeset)
        .then(features => {
            console.log(JSON.stringify(features));
        });
    });
}

function getFeaturesCreated(changeset) {
    let created = [];
    for (var feature of changeset.features) {
        if (feature.properties.action === 'create') created.push([feature, ]);
    }
    return created;
}

function getFeaturesModified(changeset) {
    let modified = [];
    let seenFeatures = [];
    for (var feature of changeset.features) {
        let featureID = feature.properties.id;
        if ((feature.properties.action === 'modify') && (seenFeatures.indexOf(featureID) === -1)) {
            modified.push(getNewAndOldVersion(changeset, feature));
            seenFeatures.push(featureID);
        }
    }
    return modified;
}

function getFeaturesDeleted(changeset) {
    let deleted = [];
    let seenFeatures = [];
    for (var feature of changeset.features) {
        var featureID = feature.properties.id;
        if ((feature.properties.action === 'delete') && (seenFeatures.indexOf(featureID) === -1)) {
            deleted.push(getNewAndOldVersion(changeset, feature));
            seenFeatures.push(featureID);
        }
    }
    return deleted;
}

function getNewAndOldVersion(changeset, touchedFeature) {
    var versions = [];
    for (var feature of changeset.features) {
        if (feature.properties.id === touchedFeature.properties.id) versions.push(feature);
    }
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

function extractFeatures(realChangeset) {
    return new Promise((resolve, reject) => {
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesCreated(changeset);
        let featuresModified = getFeaturesModified(changeset);
        let featuresDeleted = getFeaturesDeleted(changeset);

        let features = {
            'changeset_id': realChangeset['metadata']['id'],
            'features_created': featuresCreated.length,
            'features_modified': featuresModified.length,
            'features_deleted': featuresDeleted.length,
        }
        resolve(features);
    });
}
