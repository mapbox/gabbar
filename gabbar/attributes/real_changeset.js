'use strict';

module.exports = {
    isChangesetHarmful: isChangesetHarmful,
    getChangesetID: getChangesetID,
};


function isChangesetHarmful(realChangeset) {
    // TODO: Don't know what is a good way to do this.
    return 0;
}


function getChangesetID(realChangeset) {
    try {
        // The datatype of the ID is string.
        return realChangeset.metadata.id;
    } catch (error) {
        return ''
    }
}
