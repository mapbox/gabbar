'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var cAttributes = require('../../../gabbar/attributes/real_changeset');

test('Get is changeset is labelled harmful on osmcha', function (t) {
    let changesetDir = path.join(__dirname, '../../fixtures/real_changesets/');
    let realChangeset = JSON.parse(fs.readFileSync(path.join(changesetDir, '47734592.json')));

    t.equal(cAttributes.isChangesetHarmful(realChangeset), 0);
    t.end();
});
