'use strict';

const turf = require('@turf/turf');

module.exports = {
    getLineDistance: getLineDistance
};


function getLineDistance(feature) {
    try {
        return turf.lineDistance(feature);
    } catch (error) {
        return 0;
    }
}
