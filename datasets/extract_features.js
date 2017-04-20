'use strict';

const readline = require('readline');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const extractFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).extractFeatures;
const formatFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).formatFeatures;
const csv = require('csv');

if (!argv.changesets || !argv.realChangesets) {
    console.log('');
    console.log('Usage: node extract_features.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets       changesets.csv          Changesets dump from osmcha.');
    console.log('    --realChangesets   realChangesets.json     Line delimited file with real changesets.');
    console.log('');
    process.exit(0);
}

csv.parse(fs.readFileSync(argv.changesets), (error, rows) => {
    let harmful = {}
    for (let row of rows) {
        // Format: 0th column is changeset ID and 15th column has harmful detail.
        harmful[row[0]] = row[15];
    }

    const reader = readline.createInterface({
        input: fs.createReadStream(argv.realChangesets),
        output: null
    });

    reader.on('line', line => {
        let realChangeset = JSON.parse(line);

        extractFeatures(realChangeset)
        .then(features => {
            features = formatFeatures(features);

            let changesetID = features[0];
            features.splice(1, 0, harmful[changesetID]);

            csv.stringify([features], function (error, result) {
                if (!error) process.stdout.write(result);
            })
        });
    });
});
