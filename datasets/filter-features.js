'use strict';


const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const realChangesetToChangeset = require('../gabbar/utilities/real-changeset').realChangesetToChangeset;
const getSamples = require('../gabbar/filters/highway').getSamples;


if (!argv.realChangesetsDir) {
    console.log('');
    console.log('USAGE: node filter-features.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesetsDir    real-changesets/    Directory with real changesets');
    console.log('');
    process.exit(0);
}


let files = fs.readdirSync(argv.realChangesetsDir);

function getGeojson(feature) {
    try {
        feature.properties = Object.assign(feature.properties, feature.properties.tags);
        delete feature.properties.tags;
        return feature;
    } catch (error) {
        return {};
    }
}

let fc = turf.featureCollection([]);
for (let file of files.slice(0, 1000)) {
    let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesetsDir, file)));
    let changeset = realChangesetToChangeset(realChangeset);

    let versions = getSamples(changeset);
    for (let version of versions) {
        let newVersion = version[0];
        let oldVersion = version[1];

        newVersion = getGeojson(newVersion);
        oldVersion = getGeojson(oldVersion);

        let feature = newVersion;
        feature.properties.oldVersion = oldVersion;
        fc.features.push(feature);
    }
}

process.stderr.write('Number of features: ' + fc.features.length + '\n');
console.log(JSON.stringify(fc));
