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
    getNumberOfNodes: getNumberOfNodes,
    getDistanceBetweenVersions: getDistanceBetweenVersions,
    getArea: getArea,
    getNumberOfTags: getNumberOfTags,
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


function getNumberOfNodes(feature) {
    try {
        return feature.geometry.coordinates.length;
    } catch (error) {
        // Return a default length of 1.
        return 1;
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


function getDistanceBetweenVersions(newVersion, oldVersion) {
    try {
        return parseFloat(turf.distance(turf.centroid(newVersion), turf.centroid(oldVersion)).toFixed(4));
    } catch (error) {
        return 0;
    }
}


function getArea(feature) {
    try {
        return parseFloat(turf.area(feature).toFixed(4));
    } catch (error) {
        return 0;
    }
}


function getNumberOfTags(feature) {
    try {
        return Object.keys(feature.properties.tags).length;
    } catch (error) {
        return 0;
    }
}
