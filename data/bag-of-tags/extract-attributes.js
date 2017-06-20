'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');
const csv = require('csv');

if (!argv.realChangesets || !argv.changesets) {
    console.log('');
    console.log('USAGE: node extract-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesets   real-changesets/    Directory with real changesets');
    console.log('    --changesets       changesets.csv      Dump of changesets from osmcha');
    console.log('');
    process.exit(0);
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

csv.parse(fs.readFileSync(argv.changesets), (error, rows) => {

    let attributes = [];
    attributes.push([
        'changeset_id',
        'changeset_harmful',
        'tags'
    ]);

    let changesets = new Set([]);
    for (let row of rows) {
        let changesetID = row[0];

        let realChangeset;
        try {
            realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesets, changesetID + '.json')));
        } catch (error) {
            // If real changesets does not exist for the changset ID.
            continue;
        }
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');
        let features = featuresCreated.concat(featuresModified, featuresDeleted);

        // Filtering changesets where one feature was created or modified.
        if (!(features.length === 1 && featuresDeleted.length === 0)) continue;

        // Get the only feature in the array.
        let feature = features[0];

        // The first item in the array is new version of feature, second is old version.
        let newVersion = feature[0];
        let oldVersion = feature[1];

        // Filter features that have the highway tag.
        if (!('highway' in newVersion.properties.tags)) continue;

        // Skip changesets from user "chinakz"
        if (newVersion.properties.user === 'chinakz') continue;

        // Skip changesets where there was a feature modification.
        if (oldVersion && (JSON.stringify(newVersion.geometry) !== JSON.stringify(oldVersion.geometry))) continue;

        if (!changesets.has(changesetID)) {
            changesets.add(changesetID)
            attributes.push([
                changesetID,
                row[15],
                Object.keys(newVersion.properties.tags).join(' ')
            ]);
        }

        // if (attributes.length > 50) break;
    }

    csv.stringify(attributes, (error, asString) => {
        process.stdout.write(asString);
    });
});
