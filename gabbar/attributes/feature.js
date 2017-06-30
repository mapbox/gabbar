'use strict';

const turf = require('@turf/turf');

module.exports = {
    getFeatureID: getFeatureID,
    getFeatureVersion: getFeatureVersion,
    getLineDistance: getLineDistance,
    getKinks: getKinks,
    getAction: getAction,
    getGeometryType: getGeometryType,
    getUsername: getUsername,
    getUserID: getUserID,
    isNameModified: isNameModified,
    getFeatureHash: getFeatureHash,
};


function getFeatureHash(feature) {
    try {
        return [
            feature.properties.type,
            feature.properties.id,
            feature.properties.version
        ].join('!');
    } catch (error) {
        return '';
    }
}

function isNameModified(newVersion, oldVersion) {
    try {
        return newVersion.properties.tags.name === oldVersion.properties.tags.name ? 0 : 1;
    } catch (error) {
        return 0;
    }
}

function getFeatureID(feature) {
    try {
        return feature.properties.id;
    } catch (error) {
        return '';
    }
}


function getFeatureVersion(feature) {
    try {
        return parseInt(feature.properties.version);
    } catch (error) {
        return '';
    }
}


function getLineDistance(feature) {
    try {
        return parseFloat(turf.lineDistance(feature).toFixed(3));
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


function getGeometryType(feature) {
    try {
        return feature.properties.type;
    } catch (error) {
        return '';
    }
}


function getUsername(feature) {
    try {
        return feature.properties.user;
    } catch (error) {
        return '';
    }
}


function getUserID(feature) {
    try {
        return feature.properties.uid;
    } catch (error) {
        return '';
    }
}
