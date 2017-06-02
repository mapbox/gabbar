'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const request = require('request');
const mkdirp = require('mkdirp');

if (!argv.changesets || !argv.directory) {
    console.log('');
    console.log('USAGE: node download-real-changesets.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets       changesets.csv      Changesets dump from osmcha');
    console.log('    --directory        downloads/          Directory to download real changesets to');
    console.log('');
    process.exit(0);
}

csv.parse(fs.readFileSync(argv.changesets), (error, changesets) => {
    for (var i = 0; i < changesets.length; i++) {
        let changeset = changesets[i];
        let changesetID = changeset[0];

        let filepath = path.join(argv.directory, changesetID + '.json');
        // console.log(filepath);
        if ((fs.existsSync(filepath))) console.log(changesetID);
    }
});
