'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getMappingDays = require('../../../gabbar/attributes/user').getMappingDays;


test('Get user mapping days', function (t) {
    let userPath = path.join(__dirname, '../../fixtures/users/amaper.json');
    let user = JSON.parse(fs.readFileSync(userPath));

    let expected = user.extra.mapping_days;
    let actual = getMappingDays(user.name, user)
    t.equal(actual, 2);
    t.end();
});
