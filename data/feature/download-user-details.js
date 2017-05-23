'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const request = require('request');
const mkdirp = require('mkdirp');
const parser = require('real-changesets-parser');

if (!argv.realChangesetsDirectory || !argv.directory) {
    console.log('');
    console.log('USAGE: node download-user-details.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesetsDirectory      real-changesets/    Directory with real changesets');
    console.log('    --directory                    downloads/          Directory to download real changesets to');
    console.log('');
    process.exit(0);
}

// Create directories when they do not exist.
mkdirp.sync(argv.directory);
mkdirp.sync(path.join(argv.directory, 'user-details'));

function downloadAndSaveURL(url, filepath, callback) {
    // If changeset has already been download, we are good.
    if (fs.existsSync(filepath)) return callback();

    console.log(url);
    request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) return callback(error);

        fs.writeFileSync(filepath, body);
        return callback();
    });
}
let q = queue(5);
let userName, url, filepath;

let files = fs.readdirSync(argv.realChangesetsDirectory);
for (let file of files) {
    if (file === '.DS_Store') continue;

    let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesetsDirectory, file)));
    for (let feature of realChangeset.elements) {
        let userName = feature.user;
        filepath = path.join(argv.directory, 'user-details', userName + '.json');
        url = 'https://osm-comments-api.mapbox.com/api/v1/users/name/' + encodeURIComponent(userName) + '?extra=true';
        q.defer(downloadAndSaveURL, url, filepath);

        if (feature.old) {
            let oldUserName = feature.old.user;
            filepath = path.join(argv.directory, 'user-details', oldUserName + '.json');
            url = 'https://osm-comments-api.mapbox.com/api/v1/users/name/' + encodeURIComponent(oldUserName) + '?extra=true';
            q.defer(downloadAndSaveURL, url, filepath);
        }
    }
}

q.awaitAll((error, results) => {
    if (error) throw error;
});
