'use strict';

var getFeaturesByAction = require('../utilities/changeset').getFeaturesByAction;

module.exports = {
    getSamples: getSamples
};


// Return an array of samples from the changeset for the model.
function getSamples(changeset) {
    let featuresCreated = getFeaturesByAction(changeset, 'create');
    let featuresModified = getFeaturesByAction(changeset, 'modify');
    let featuresDeleted = getFeaturesByAction(changeset, 'delete');
    let features = featuresCreated.concat(featuresModified, featuresDeleted);

    // NOTE: Currently processsing changesets with one feature modificaton.
    if (features.length !== 1) return [];

    let samples = [];
    for (let feature of features) {
        let newVersion = feature[0];
        let oldVersion = feature[1];

        let interested = false;
        if (newVersion && ('highway' in newVersion.properties.tags)) interested = true;
        if (oldVersion && ('highway' in oldVersion.properties.tags)) interested = true;

        if (interested) samples.push(feature);
    }
    return samples;
}
