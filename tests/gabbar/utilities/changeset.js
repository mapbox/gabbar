'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getNewAndOldVersion = require('../../../gabbar/utilities/changeset').getNewAndOldVersion;
var getFeaturesByAction = require('../../../gabbar/utilities/changeset').getFeaturesByAction;
var getAllFeatures = require('../../../gabbar/utilities/changeset').getAllFeatures;


test('Get new and old version for a modified feature', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let expected = [changeset.features[0], changeset.features[1]];

    let feature = changeset.features[0];
    let actual = getNewAndOldVersion(changeset, feature);

    t.equal(JSON.stringify(actual), JSON.stringify(expected));
    t.end();
});

test('Get features by action', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let actual;

    // There are no created features in the fixture.
    actual = getFeaturesByAction(changeset, 'create');
    t.equal(actual.length, 0);

    // There is one modified feature in the fixture.
    actual = getFeaturesByAction(changeset, 'modify');
    t.equal(actual.length, 1);

    // There are no deleted features in the fixture.
    actual = getFeaturesByAction(changeset, 'delete');
    t.equal(actual.length, 0);

    t.end();
});

test('Get all features', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    // There are no created features in the fixture.
    let actual = getAllFeatures(changeset);
    t.equal(actual.length, 1);

    t.end();
});
