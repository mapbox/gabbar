'use strict';


module.exports = {
    getNewAndOldVersion: getNewAndOldVersion,
    getFeaturesByAction: getFeaturesByAction,
    getAllFeatures: getAllFeatures,
};


function getNewAndOldVersion(changeset, touchedFeature) {
    var versions = [];
    for (var feature of changeset.features) {
        if (feature.properties.id === touchedFeature.properties.id) versions.push(feature);
    }
    // There is only one occourances for features that are newly created.
    if (versions.length === 1) return versions;

    if (versions[0].properties.version > versions[1].properties.version) return [versions[0], versions[1]];
    else return [versions[1], versions[0]];
}


function getFeaturesByAction(changeset, action) {
    let features = [];
    let seen = [];
    for (let feature of changeset.features) {
        let featureID = feature.properties.id;
        if ((feature.properties.action === action) && (seen.indexOf(featureID) === -1)) {
            features.push(getNewAndOldVersion(changeset, feature));
            seen.push(featureID);
        }
    }
    return features;
}

function getAllFeatures(changeset) {
    let features = [];
    let featuresCreated = getFeaturesByAction(changeset, 'create');
    let featuresModified = getFeaturesByAction(changeset, 'modify');
    let featuresDeleted = getFeaturesByAction(changeset, 'delete');
    return featuresCreated.concat(featuresModified, featuresDeleted);
}
