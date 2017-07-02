'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');
var realChangesetToChangeset = require('../../../gabbar/utilities/real-changeset').realChangesetToChangeset;

test('Convert real changeset to changeset with features', function (t) {
    let realChangesetPath = path.join(__dirname, '../../fixtures/real_changesets/48255884.json');
    let realChangeset = JSON.parse(fs.readFileSync(realChangesetPath));

    let expectedPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let expected = JSON.parse(fs.readFileSync(expectedPath));

    let actual = realChangesetToChangeset(realChangeset);
    t.equal(JSON.stringify(actual), JSON.stringify(expected));
    t.end();
});
