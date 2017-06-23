'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const csv = require('csv');
const turf = require('@turf/turf');
const realChangesetToChangeset = require('../gabbar/utilities/real-changeset').realChangesetToChangeset;
const getSamples = require('../gabbar/filters/highway').getSamples;

if (!argv.changesets || !argv.realChangesetsDir || !argv.userDetailsDir) {
    console.log('');
    console.log('USAGE: node highway-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets           changesets.csv      Dump of changesets from osmcha');
    console.log('    --realChangesetsDir    real-changesets/    Directory with real changesets');
    console.log('    --userDetailsDir       user-details/       Directory with user details');
    console.log('');
    process.exit(0);
}

csv.parse(fs.readFileSync(argv.changesets), (error, rows) => {

    let header = [
        'changeset_id',
        'changeset_harmful',
    ];
    let attributes = [];
    attributes.push(header);

    let seenChangesets = new Set([]);
    for (let row of rows) {
        let changesetID = row[0];

        // Checking for duplicate changesets.
        if (seenChangesets.has(changesetID)) continue;
        seenChangesets.add(changesetID)

        let realChangeset;
        try {
            realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesetsDir, changesetID + '.json')));
        } catch (error) {
            // When the real changeset file does not exist.
            continue;
        }
        let changeset = realChangesetToChangeset(realChangeset);

        let harmful = row[1];
        if (harmful === 'true') harmful = 1
        else if (harmful === 'false') harmful = 0

        let samples = getSamples(changeset);
        for (let sample of samples) {
            attributes.push([
                changesetID,
                harmful
            ]);
        }

        // if (samples.length) console.log(attributes[attributes.length - 1]);
    }
    csv.stringify(attributes, (error, asString) => {
        console.log(asString);
    });
});
