'use strict';


const rcAttributes = require('./real_changeset');
const fAttributes = require('./feature');
const uAttributes = require('./user');
const simpleStatistics = require('simple-statistics');

module.exports = {
    tagsToString: tagsToString,
    getAttributeHeaders: getAttributeHeaders,
    getAttributes: getAttributes,
    isHighwayTagDeleted: isHighwayTagDeleted,
    isHighwayTagCreated: isHighwayTagCreated,
    getHighwayValueDifference: getHighwayValueDifference,
};


let CLASSIFICATION = [
    'motorway',
    'trunk',
    'primary',
    'secondary',
    'tertiary',
    'unclassified',
    'residential',
    'service',
    'motorway_link',
    'trunk_link',
    'primary_link',
    'secondary_link',
    'tertiary_link',
    'living_street',
    'pedestrian',
    'track',
    'bus_guideway',
    'escape',
    'raceway',
    'road',
    'footway',
    'bridleway',
    'steps',
    'path',
    'cycleway',
    'proposed',
    'construction',
    'bus_stop',
    'crossing',
    'elevator',
    'emergency_access_point',
    'give_way',
    'mini_roundabout',
    'motorway_junction',
    'passing_place',
    'rest_area',
    'speed_camera',
    'street_lamp',
    'services',
    'stop',
    'traffic_signals',
    'turning_circle',
];


function getAttributes(realChangeset, changeset, newVersion, oldVersion) {
    try {
        return [
            rcAttributes.getChangesetID(realChangeset),
            rcAttributes.isChangesetHarmful(realChangeset),
            fAttributes.getFeatureID(newVersion),
            fAttributes.getGeometryType(newVersion),
            fAttributes.getAction(newVersion) === 'create' ? 1 : 0,
            fAttributes.getAction(newVersion) === 'modify' ? 1 : 0,
            fAttributes.getAction(newVersion) === 'delete' ? 1 : 0,
            fAttributes.getFeatureVersion(newVersion),
            isHighwayTagCreated(newVersion, oldVersion),
            isHighwayTagDeleted(newVersion, oldVersion),
            getHighwayValueDifference(newVersion, oldVersion),
            simpleStatistics.sumSimple(fAttributes.getPrimaryTagCount(newVersion)) - simpleStatistics.sumSimple(fAttributes.getPrimaryTagCount(oldVersion)),
            fAttributes.getBBOXArea(newVersion),
            fAttributes.getLengthOfLongestSegment(newVersion),
        ];
    } catch (error) {
        console.log(error);
    }
}

function getAttributeHeaders() {
    return [
        'changeset_id',
        'changeset_harmful',
        'feature_id',
        'feature_type',
        'action_create',
        'action_modify',
        'action_delete',
        'feature_version',
        'highway_tag_created',
        'highway_tag_deleted',
        'highway_value_difference',
        'primary_tags_difference',
        'area_of_feature_bbox',
        'length_of_longest_segment',
    ];
}


function tagsToString(feature, anotherFeature) {
    let tags = feature ? feature.properties.tags : {};
    let anotherTags = anotherFeature ? anotherFeature.properties.tags : {};

    let toSkipEqual = ['name', 'old_name', 'int_name', 'description', 'note', 'source', 'website', 'wikidata', 'wikipedia', 'email', 'FIXME', 'alt_name', 'phone'];
    let toSkipIn = ['name:', 'tiger:', 'gnis:', 'addr:', 'name_', 'old_name_', 'yh:', 'ref:'];

    let results = [];
    for (var key in tags) {

        if (toSkipEqual.indexOf(key) !== -1) continue;
        let skip = false;
        for (let item of toSkipIn) {
            if (key.indexOf(item) !== -1) skip = true;
        }
        if (skip) continue;

        // Interested only when things change.
        try {
            if (tags[key] === anotherTags[key]) continue;
        } catch (error) {
            // When anotherTags is None, nothing extra to do.
        }
        results.push('{' + key + '=' + tags[key] + '}');
    }
    return results.length ? results.join(' ') : '';
}


function isHighwayTagDeleted(newVersion, oldVersion) {
    try {
        if (('highway' in oldVersion.properties.tags) && !('highway' in newVersion.properties.tags)) {
            let value = oldVersion.properties.tags.highway;
            return (CLASSIFICATION.indexOf(value) !== -1) ? CLASSIFICATION.length - CLASSIFICATION.indexOf(value) : CLASSIFICATION.length;
        } else {
            return 0;
        }
    } catch (error) {
        return 0;
    }
}


function isHighwayTagCreated(newVersion, oldVersion) {
    try {
        if (!oldVersion && ('highway' in newVersion.properties.tags)) {
            let value = newVersion.properties.tags.highway;
            return (CLASSIFICATION.indexOf(value) !== -1) ? CLASSIFICATION.length - CLASSIFICATION.indexOf(value) : CLASSIFICATION.length;
        }
        else if (('highway' in newVersion.properties.tags) && !('highway' in oldVersion.properties.tags)) {
            let value = newVersion.properties.tags.highway;
            return (CLASSIFICATION.indexOf(value) !== -1) ? CLASSIFICATION.length - CLASSIFICATION.indexOf(value) : CLASSIFICATION.length;
        }
        else {
            return 0;
        }
    } catch (error) {
        return 0;
    }
}


function getHighwayValueDifference(newVersion, oldVersion) {
    // In the order listed here: https://wiki.openstreetmap.org/wiki/Key:highway

    try {
        let newValue = newVersion.properties.tags.highway;
        let oldValue = oldVersion.properties.tags.highway;

        // When the highway tag does not exist in either new or old version. Skip.
        if (!newValue || !oldValue) return 0;

        let newClassification = CLASSIFICATION.indexOf(newValue) !== -1 ? CLASSIFICATION.indexOf(newValue) : CLASSIFICATION.length;
        let oldClassification = CLASSIFICATION.indexOf(oldValue) !== -1 ? CLASSIFICATION.indexOf(oldValue) : CLASSIFICATION.length;

        return newClassification - oldClassification;
    } catch (error) {
        return 0;
    }
}
