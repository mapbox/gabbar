'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');
const csv = require('csv');

if (!argv.realChangesets || !argv.changesets) {
    console.log('');
    console.log('USAGE: node filter-features.js OPTIONS');
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
    let files = fs.readdirSync(argv.realChangesets);
    for (let file of files) {
        if (file === '.DS_Store') continue;

        let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesets, file)));
        let changeset = parser(realChangeset);
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        for (let versions of featuresModified) {
            let newVersion = versions[0];
            let oldVersion = versions[1];

            if (newVersion.properties.tags.highway === 'unclassified' && oldVersion.properties.tags.highway === 'residential') {
                let changesetID = newVersion.properties.changeset;
                let user = newVersion.properties.user;
                let harmful = '';
                for (let row of rows) {
                    if (changesetID === row[0]) harmful = row[1];
                }
                console.log(changesetID + ',' + harmful + ',' + user);
            }
        }
    }
});
