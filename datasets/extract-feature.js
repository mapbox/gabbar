'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const rcUtilities = require('../gabbar/utilities/real-changeset');
const cUtilities = require('../gabbar/utilities/changeset');


if (!argv.realChangesetsDir || !argv.changesetID || !argv.featureType || !argv.featureID) {
    console.log('');
    console.log('USAGE: node highway-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesetsDir    real-changesets/');
    console.log('    --changesetID          ID of changeset (Ex: 135233)');
    console.log('    --featureType          node | way | relation');
    console.log('    --featureID            ID of feature (Ex: 234334)');
    console.log('');
    process.exit(0);
}

let filepath = path.join(argv.realChangesetsDir, argv.changesetID + '.json');
let realChangeset = JSON.parse(fs.readFileSync(filepath));
let changeset = rcUtilities.realChangesetToChangeset(realChangeset);

let versions = cUtilities.getAllFeatures(changeset);
for (let version of versions) {
    let newVersion = version[0];
    let oldVersion = version[1];

    if ((newVersion.properties.type === argv.featureType) && (newVersion.properties.id === argv.featureID)) {
        console.log(JSON.stringify(turf.featureCollection(version), null, 4));
        process.exit(0);
    }
}
