'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    getUserDetails: getUserDetails
};


// directory is an optional parameter.
function getUserDetails(username, directory) {
    if (directory) {
        try {
            return JSON.parse(fs.readFileSync(path.join(directory, username + '.json')));
        } catch (error) {
            throw (error);
            // When local file for user does not exist.
            return getUserDetails(username);
        }
    } else {
        // TODO: Need to do a network request.
        return {};
    }
}
