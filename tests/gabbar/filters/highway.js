'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getSamples = require('../../../gabbar/filters/highway').getSamples;


test('Get samples for changeset with a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let actual = getSamples(changeset);
    t.equal(actual.length, 1);

    t.end();
});

test('Get samples for changeset without a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/47734592.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let actual = getSamples(changeset);
    t.equal(actual.length, 0);

    t.end();
});

test('Get samples with a name modification with forTraining', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/49685016.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    // Get samples for training.
    let actual = getSamples(changeset, true);
    t.equal(actual.length, 0);

    // Get samples during deployment.
    actual = getSamples(changeset, false);
    t.equal(actual.length, 1);

    t.end();
});
