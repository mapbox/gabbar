'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');

const OSMCHA_URL = 'https://osmcha.mapbox.com/'

if (!argv.predictionsDir) {
    console.log('');
    console.log('USAGE: node analyze-predictions.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --predictionsDir   predictions/    Directory with predictions from Gabbar');
    console.log('');
    process.exit(0);
}

function getFeatureHash(prediction) {
    let hash = [prediction.feature_type, prediction.feature_id, prediction.attributes.feature_version].join('-');
    return hash;
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;  //The maximum is inclusive and the minimum is inclusive
}


let predictions = fs.readdirSync(argv.predictionsDir);
console.log('Total predictions: ' + predictions.length);

let harmfuls = [], goods = [];
for (let prediction of predictions) {
    prediction = JSON.parse(fs.readFileSync(path.join(argv.predictionsDir, prediction)));

    if (prediction == 1) harmfuls.push(prediction)
    else goods.push(prediction)
}
console.log('Features predicted good: ' + goods.length);
console.log('Features predicted harmful: ' + harmfuls.length);


console.log('\nChangesets predicted good ...');
let goodChangesets = new Set([]);
while (true) {
    // To review a sample of 25 changesets.
    if (goodChangesets.size > 25) break;

    // Randomly select a good changeset.
    let good = goods[getRandomIntInclusive(0, goods.length)];

    // If changeset is already seen, skip.
    if (goodChangesets.has(good.changeset_id)) continue;

    console.log(OSMCHA_URL + good.changeset_id + '/' + '\t' + getFeatureHash(good) + '.json');
    goodChangesets.add(good.changeset_id);
}
