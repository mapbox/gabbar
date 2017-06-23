'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getSamples = require('../../../gabbar/filters/highway').getSamples;
var getLineDistance = require('../../../gabbar/attributes/feature').getLineDistance;

test('Get line distance for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.true(getLineDistance(newVersion) > 0);
        t.true(getLineDistance(oldVersion) > 0);
    }

    t.end();
});
