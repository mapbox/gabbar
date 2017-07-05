'use strict';

const argv = require('minimist')(process.argv.slice(2));
const request = require('request');
const queue = require('d3-queue').queue;

if (argv.help) {
    console.log('');
    console.log('USAGE: node download-real-changesets.js');
    console.log('');
    process.exit(0);
}

// Url to download checked chagesets with one feature modifications.
let url = 'https://osmcha.mapbox.com/api/v1/changesets/?page_size=500&format=json&checked=1&date__gte=2017-01-01'

function download(url, callback) {
    process.stderr.write(url + '\n');
    request(url, (error, response, body) => {
        if (error || response.statusCode !== 200) return callback();

        let fc = JSON.parse(body);

        let results = [];
        for (let feature of fc.features) {
            results.push([feature.id + ',' + feature.properties.harmful]);
        }
        console.log(results.join('\n'));

        // Check if we have reached the end of stream.
        if (!fc.next) process.exit(0);

        callback();
    });
}

let q = queue(1);
console.log('changeset_id,harmful');
for (var i = 1; i < 100; i++) {
    let pageURL = url + '&page=' + i;
    q.defer(download, pageURL);
}
q.awaitAll((error, results) => {
    if (error) console.log(error);
});
