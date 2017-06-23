'use strict';

const turf = require('@turf/turf');

module.exports = {
    getLineDistance: getLineDistance,
    getKinks: getKinks,
    getAction: getAction,
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

function getAction(feature) {
    try {
        return feature.properties.action;
    } catch (error) {
        return '';
    }
}
