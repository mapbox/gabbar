'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getSamples = require('../../../gabbar/filters/highway').getSamples;
var fAttributes = require('../../../gabbar/attributes/feature');
var cUtilities = require('../../../gabbar/utilities/changeset');

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


test('Get number of nodes in highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(fAttributes.getNumberOfNodes(newVersion), 20);
        t.equal(fAttributes.getNumberOfNodes(oldVersion), 20);
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


test('Get user ID for a highway', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        t.equal(fAttributes.getUserID(newVersion), '5748310');
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


test('Test name modified of a feature without name modification', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        let actual = fAttributes.getFeatureHash(newVersion);

        t.true(actual.indexOf(newVersion.properties.type) !== -1);
        t.true(actual.indexOf(newVersion.properties.id) !== -1);
        t.true(actual.indexOf(newVersion.properties.version) !== -1);
    }

    t.end();
});


test('Get distance between versions', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48648149.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        let actual = fAttributes.getDistanceBetweenVersions(newVersion, oldVersion);
        t.equal(actual, 0.0021);
    }

    t.end();
});


test('Get get feture area', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48648149.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(fAttributes.getArea(newVersion), 0);
        t.equal(fAttributes.getArea(oldVersion), 0);
    }

    t.end();
});



test('Get tags of a feature', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48648149.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];
        t.equal(fAttributes.getNumberOfTags(newVersion), 2);
        t.equal(fAttributes.getNumberOfTags(oldVersion), 2);
    }

    t.end();
});


test('Get primary tag count of a feature', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48648149.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let samples = getSamples(changeset);
    for (let sample of samples) {
        let newVersion = sample[0];
        let oldVersion = sample[1];

        let newCount = fAttributes.getPrimaryTagCount(newVersion);
        t.equal(newCount[9], 1);
    }

    t.end();
});


test('Get primary tags', function (t) {
    let actual = fAttributes.getPrimaryTags();
    t.equal(actual.length, 26);
    t.end();
});


test('Get get area of feature bbox', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let sample = getSamples(changeset)[0];
    let newVersion = sample[0];

    let actual = fAttributes.getBBOXArea(newVersion);
    t.equal(actual, 39420.1294);
    t.end();
});


test('Get length of longest segment', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let sample = getSamples(changeset)[0];
    let newVersion = sample[0];

    let actual = fAttributes.getLengthOfLongestSegment(newVersion);
    t.equal(actual, 0.033);
    t.end();
});


test('Test if name or name: properties are touched', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/47734592.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let sample = cUtilities.getAllFeatures(changeset)[0];
    let newVersion = sample[0];
    let oldVersion = sample[1];
    t.equal(fAttributes.isNameTouched(newVersion, oldVersion), 1);

    t.end();
});
