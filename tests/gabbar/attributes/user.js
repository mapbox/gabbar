'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getMappingDays = require('../../../gabbar/attributes/user').getMappingDays;
var getUserDetails = require('../../../gabbar/datasources/user').getUserDetails;


test('Get user mapping days', function (t) {
    let username = 'amaper';
    let userDetailsDir = path.join(__dirname, '../../fixtures/users/');

    let userDetails = getUserDetails(username, userDetailsDir);

    t.equal(getMappingDays(userDetails), 2);
    t.end();
});
