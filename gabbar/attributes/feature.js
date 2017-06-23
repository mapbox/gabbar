'use strict';

const turf = require('@turf/turf');

module.exports = {
    getLineDistance: getLineDistance,
    getKinks: getKinks
};


function getLineDistance(feature) {
    try {
        return turf.lineDistance(feature);
    } catch (error) {
        return 0;
    }
}

function getKinks(feature) {
    try {
        return turf.kinks(feature).features;
    } catch (error) {
        return [];
    }
}
