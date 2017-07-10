'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');
const turf = require('@turf/turf');

const cUtilities = require('../gabbar/utilities/changeset');
const rcUtilities = require('../gabbar/utilities/real-changeset');


if (!argv.realChangesets) {
    console.log('');
    console.log('USAGE: node filter-features.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesets   real-changesets/    Directory with real changesets');
    console.log('');
    process.exit(0);
}

function getLineDistance(feature) {
    return turf.lineDistance(feature).toFixed(2);
}

function getNodeCount(feature) {
    return feature.geometry.coordinates.length;
}

let files = fs.readdirSync(argv.realChangesets);
for (let file of files) {
    if (file === '.DS_Store') continue;

    let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesets, file)));
    let changesetID = realChangeset.metadata.id;
    let changeset = rcUtilities.realChangesetToChangeset(realChangeset);

    let versions = cUtilities.getAllFeatures(changeset);
    for (let version of versions) {

        try {
            let newVersion = version[0];
            let oldVersion = version[1];

            if ((newVersion.properties.user === 'chinakz') || (oldVersion.properties.user === 'chinakz')) continue;

            let newTags = newVersion.properties.tags;
            let oldTags = oldVersion.properties.tags;

            if ((oldTags.highway === 'residential') && (newTags.highway === 'unclassified')) {
                console.log([
                    changesetID,
                    getLineDistance(newVersion),
                    getNodeCount(newVersion),
                ].join(', '));
            }

        } catch (error) {
            console.log(error);
            continue;
        }
    }
}
