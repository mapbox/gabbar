'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');

if (!argv.realChangesetsDir) {
    console.log('');
    console.log('USAGE: node prepare-reverted.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesetsDir    real-changesets/    Directory with real changesets');
    console.log('');
    process.exit(0);
}

let files = fs.readdirSync(argv.realChangesetsDir);
let harmfuls = new Set([]);
for (let file of files) {
    let currentChangeset = file.split('.')[0];
    let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesetsDir, file)));
    let changeset = parser(realChangeset);

    for (let feature of changeset.features) {
        // Don't add the current changeset to the list.
        if (feature.properties.changeset === currentChangeset) continue;
        harmfuls.add(feature.properties.changeset);
    }
}
harmfuls.forEach((item) => {
    console.log(item);
});
