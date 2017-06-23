'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');
var getNewAndOldVersion = require('../../../gabbar/utilities/changeset').getNewAndOldVersion;

test('Get new and old version for a modified feature', function (t) {
    let changesetPath = path.join(__dirname, '../../fixtures/changesets/48255884.json');
    let changeset = JSON.parse(fs.readFileSync(changesetPath));

    let expected = [changeset.features[0], changeset.features[1]];

    let feature = changeset.features[0];
    let actual = getNewAndOldVersion(changeset, feature);

    t.equal(JSON.stringify(actual), JSON.stringify(expected));
    t.end();
});
