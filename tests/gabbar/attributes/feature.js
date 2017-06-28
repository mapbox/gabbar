'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getSamples = require('../../../gabbar/filters/highway').getSamples;
var fAttributes = require('../../../gabbar/attributes/feature');

test('Get line distance for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.true(fAttributes.getLineDistance(newVersion) > 0);
        t.true(fAttributes.getLineDistance(oldVersion) > 0);
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
        t.equal(fAttributes.getKinks(newVersion).length, 0);
        t.equal(fAttributes.getKinks(oldVersion).length, 0);
    }

    t.end();
});


test('Get action for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getAction(newVersion), 'modify');
    }

    t.end();
});


test('Get geometry type for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getGeometryType(newVersion), 'way');
    }

    t.end();
});


test('Get username for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getUsername(newVersion), 'VilleDille');
    }

    t.end();
});


test('Get feature ID of highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getFeatureID(newVersion), '490324518');
    }

    t.end();
});


test('Get version of the feature highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getFeatureVersion(newVersion), 2);
    }

    t.end();
});


test('Test name modified of a feature with name modification', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/47734592.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(fAttributes.isNameModified(newVersion, oldVersion), 1);
    }

    t.end();
});

test('Test name modified of a feature without name modification', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(fAttributes.isNameModified(newVersion, oldVersion), 0);
    }

    t.end();
});
