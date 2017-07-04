'use strict';


const rcAttributes = require('./real_changeset');
const fAttributes = require('./feature');
const uAttributes = require('./user');
const hAttributes = require('./highway');


module.exports = {
    tagsToString: tagsToString,
    getAttributeHeaders: getAttributeHeaders,
    getAttributes: getAttributes,
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
