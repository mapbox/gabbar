'use strict';


const parser = require('real-changesets-parser');


module.exports = {
    realChangesetToChangeset: realChangesetToChangeset
};


function realChangesetToChangeset(realChangeset) {
    return parser(realChangeset);
}
