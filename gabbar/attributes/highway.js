'use strict';


const rcAttributes = require('./real_changeset');
const fAttributes = require('./feature');
const uAttributes = require('./user');
const hAttributes = require('./highway');


module.exports = {
    tagsToString: tagsToString,
    getAttributeHeaders: getAttributeHeaders,
    getAttributes: getAttributes,
    isHighwayTagDeleted: isHighwayTagDeleted,
    isHighwayTagCreated: isHighwayTagCreated,
    getHighwayValueDifference: getHighwayValueDifference,
};



function getAttributes(realChangeset, changeset, newVersion, oldVersion, newUserDetails, oldUserDetails) {
    return [
        rcAttributes.getChangesetID(realChangeset),
        rcAttributes.isChangesetHarmful(realChangeset),
        fAttributes.getFeatureID(newVersion),
        fAttributes.getFeatureVersion(newVersion),
        fAttributes.getAction(newVersion) === 'create' ? 1 : 0,
        fAttributes.getAction(newVersion) === 'modify' ? 1 : 0,
        fAttributes.getAction(newVersion) === 'delete' ? 1 : 0,
        fAttributes.getGeometryType(newVersion) === 'node' ? 1 : 0,
        fAttributes.getGeometryType(newVersion) === 'way' ? 1 : 0,
        fAttributes.getGeometryType(newVersion) === 'relation' ? 1 : 0,
        fAttributes.getLineDistance(newVersion),
        fAttributes.getKinks(newVersion).length,
        uAttributes.getMappingDays(oldUserDetails),
        uAttributes.getMappingDays(newUserDetails),
        tagsToString(oldVersion, newVersion),
        tagsToString(newVersion, oldVersion),
    ];
}

function getAttributeHeaders() {
    return [
        'changeset_id',
        'changeset_harmful',
        'feature_id',
        'feature_version',
        'action_create',
        'action_modify',
        'action_delete',
        'geometry_type_node',
        'geometry_type_way',
        'geometry_type_relation',
        'geometry_line_distance',
        'geometry_kinks',
        'old_user_mapping_days',
        'new_user_mapping_days',
        'old_tags',
        'new_tags',
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
            return 1;
        } else {
            return 0;
        }
    } catch (error) {
        return 0;
    }
}


function isHighwayTagCreated(newVersion, oldVersion) {
    try {
        if (!oldVersion && ('highway' in newVersion.properties.tags)) return 1;
        else if (('highway' in newVersion.properties.tags) && !('highway' in oldVersion.properties.tags)) return 1;
        else return 0;
    } catch (error) {
        return 0;
    }
}


function getHighwayValueDifference(newVersion, oldVersion) {
    // In the order listed here: https://wiki.openstreetmap.org/wiki/Key:highway
    let classification = [
        'motorway',
        'trunk',
        'primary',
        'secondary',
        'tertiary',
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
        'unclassified',
    ];

    try {
        let newValue = newVersion.properties.tags.highway;
        let oldValue = oldVersion.properties.tags.highway;

        let newClassification = classification.indexOf(newValue) !== -1 ? classification.indexOf(newValue) : classification.length;
        let oldClassification = classification.indexOf(oldValue) !== -1 ? classification.indexOf(oldValue) : classification.length;

        return newClassification - oldClassification;
    } catch (error) {
        return 0;
    }
}
