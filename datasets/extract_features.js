'use strict';

const readline = require('readline');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const extractFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).extractFeatures;
const formatFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).formatFeatures;
const csv = require('csv');

if (!argv.changesets) {
    console.log('');
    console.log('Usage: node extract_features.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets   changesets.json     Line delimited file with real changesets.');
    console.log('');
    process.exit(0);
}

const reader = readline.createInterface({
    input: fs.createReadStream(argv.changesets),
    output: null
});

reader.on('line', line => {
    let realChangeset = JSON.parse(line);

    extractFeatures(realChangeset)
    .then(features => {
        features = formatFeatures(features);
        csv.stringify([features], function (error, result) {
            if (!error) process.stdout.write(result);
        })
    });
});
