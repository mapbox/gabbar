'use strict';

var test = require('tape');
var fs = require('fs');
var path = require('path');

var getUserDetails = require('../../../gabbar/datasources/user').getUserDetails;


test('Get user details in local directory', function (t) {
    let userDetailsDir = path.join(__dirname, '../../fixtures/users/');

    let username = 'amaper';
    let userDetails = getUserDetails(username, userDetailsDir);

    t.equal(Object.keys(userDetails).length, 6);
    t.end();
});
