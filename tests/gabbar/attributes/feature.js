'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getSamples = require('../../../gabbar/filters/highway').getSamples;
var getLineDistance = require('../../../gabbar/attributes/feature').getLineDistance;
var getKinks = require('../../../gabbar/attributes/feature').getKinks;
var getAction = require('../../../gabbar/attributes/feature').getAction;

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


test('Get kinks for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(getKinks(newVersion).length, 0);
        t.equal(getKinks(oldVersion).length, 0);
    }

    t.end();
});


test('Get action for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(getAction(newVersion), 'modify');
    }

    t.end();
});
