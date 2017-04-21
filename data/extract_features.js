'use strict';

const readline = require('readline');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const extractFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).extractFeatures;
const formatFeatures = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).formatFeatures;
const getFeatureList = require(path.join(__dirname, '../gabbar/helpers/real_changesets')).getFeatureList;
const csv = require('csv');

if (!argv.realChangesets) {
    console.log('');
    console.log('Usage: node extract_features.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesets   realChangesets.json     Line delimited file with real changesets.');
    console.log('    --userDetails      userDetails.json        Line delimited file with user details [OPTIONAL].');
    console.log('    --changesets       changesets.csv          Changesets dump from osmcha [OPTIONAL].');
    console.log('');
    process.exit(0);
}

function getHarmful(filepath) {
    return new Promise((resolve, reject) => {
        if (!filepath) return resolve(undefined);

        csv.parse(fs.readFileSync(filepath), (error, rows) => {
            let harmful = {};
            for (let row of rows) {
                // Format: 0th column is changeset ID and 15th column has harmful detail.
                harmful[row[0]] = row[15];
            }
            resolve(harmful);
        });
    });
}

function getUserDetails(filepath) {
    return new Promise((resolve, reject) => {
        if (!filepath) return resolve(undefined);

        let userDetails = {};
        const reader = readline.createInterface({
            input: fs.createReadStream(filepath),
            output: null
        });

        reader.on('line', line => {
            let userDetail = JSON.parse(line);
            let userID = userDetail['id'];
            if (!(userID in userDetails)) userDetails[userID] = userDetail;
        });

        reader.on('close', () => {
            resolve(userDetails);
        });
    });
}

function extract(filename, userDetails, harmful) {
    const reader = readline.createInterface({
        input: fs.createReadStream(argv.realChangesets),
        output: null
    });

    reader.on('line', line => {
        let realChangeset = JSON.parse(line);

        extractFeatures(realChangeset, userDetails)
        .then(features => {
            features = formatFeatures(features);

            if (harmful) {
                let changesetID = features[0];
                features.splice(1, 0, harmful[changesetID]);
            }
            csv.stringify([features], function (error, result) {
                if (!error) process.stdout.write(result);
            })
        })
        .catch(error => {
            throw error;
        });
    });
}

let q = [
    getUserDetails(argv.userDetails),
    getHarmful(argv.changesets)
];
Promise.all(q)
.then(results => {
    let header = getFeatureList();
    csv.stringify([header], (error, headerAsString) => {
        process.stdout.write(headerAsString);
        extract(argv.realChangesets, results[0], results[1]);
    })
})
.catch(error => {
    throw error;
});
