'use strict';

module.exports = {
    getMappingDays: getMappingDays
};

function getMappingDays(username, userDetails) {
    if (userDetails) return parseInt(userDetails.extra.mapping_days);
}
