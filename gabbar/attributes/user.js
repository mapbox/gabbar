'use strict';

module.exports = {
    getMappingDays: getMappingDays
};

function getMappingDays(userDetails) {
    try {
        return parseInt(userDetails.extra.mapping_days);
    } catch (error) {
        return 0;
    }
}
