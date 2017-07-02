'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getFeaturesByAction = require('../../../gabbar/utilities/changeset').getFeaturesByAction;
var rcAttributes = require('../../../gabbar/attributes/real_changeset');
var hAttributes = require('../../../gabbar/attributes/highway');
var fAttributes = require('../../../gabbar/attributes/feature');
var hFilters = require('../../../gabbar/filters/highway');


test('Convert tags into a string for tokenization', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let modifiedFeatures = getFeaturesByAction(changeset, 'modify');

    // Let's take one of the modified features.
    let feature = modifiedFeatures[0];

    // Feature is an array in [newVersion, oldVersion] format.
    let asString = hAttributes.tagsToString(feature[0], feature[1]);

    t.equal(asString, '{landuse=forest}');
    t.end();
});


test('Get headers of attributes', function (t) {
    let headers = hAttributes.getAttributeHeaders();
    t.equal(headers.length, 16);
    t.end();
});


test('Get all attributes of the feature', function (t) {
    let realChangeset = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fixtures/real_changesets/48255884.json')));
    let changeset = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fixtures/changesets/48255884.json')));
    let newUserDetails = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fixtures/users/VilleDille.json')));
    let oldUserDetails = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fixtures/users/VilleDille.json')));

    let samples = hFilters.getSamples(changeset);

    for (let sample of samples) {
        let attributes = hAttributes.getAttributes(realChangeset, changeset, sample[0], sample[1], newUserDetails, oldUserDetails);
        t.equal(attributes.length, 16);
        t.equal(attributes.indexOf(rcAttributes.getChangesetID(realChangeset)), 0);
        t.equal(attributes.indexOf(fAttributes.getFeatureID(sample[0])), 2);
    }
    t.end();
});
