'use strict';

const readline = require('readline');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));
const path = require('path');
const csv = require('csv');

if (!argv.features) {
    console.log('');
    console.log('USAGE: node user_details.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --features     features.csv');
    console.log('');
    process.exit(0);
}

let userDetails = {};
let header = false;
csv.parse(fs.readFileSync(argv.features), (error, features) => {
    if (error) console.log(error);
    for (let feature of features) {

        if (!header) {
            header = true;
            continue;
        }

        let userID = feature[5];
        if (!(userID.length) || (userID in userDetails)) continue;

        userDetails[userID] = {
            'id': feature[5],
            'name': feature[6],
            'first_edit': feature[7],
            'changeset_count': feature[8],
            'num_changes': feature[9]
        };
    }

    for (let userID in userDetails) {
        console.log(JSON.stringify(userDetails[userID]));
    }
});
