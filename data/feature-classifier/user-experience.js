'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');

if (!argv.realChangesetsDir || !argv.userDetailsDir) {
    console.log('');
    console.log('USAGE: node prepare-reverted.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesetsDir    real-changesets/    Directory with real changesets');
    console.log('    --userDetailsDir       user-details/       Directory with user details');
    console.log('');
    process.exit(0);
}

console.log([
    'changeset_id',
    'user_name',
    'user_changesets',
    'user_features',
    'user_mapping_days'
].join(','));

let files = fs.readdirSync(argv.realChangesetsDir);
for (let file of files) {
    try {
        if (file === '.DS_Store') continue;

        let currentChangeset = file.split('.')[0];
        let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesetsDir, file)));

        let username = realChangeset.metadata.user;
        let userDetails = JSON.parse(fs.readFileSync(path.join(argv.userDetailsDir, username + '.json')));

        console.log([
            currentChangeset,
            userDetails['name'],
            userDetails['changeset_count'],
            userDetails['num_changes'],
            userDetails['extra']['mapping_days']
        ].join(','));
    } catch (error) {
        // If some file is missing.
        continue;
    }
}
