'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');
const csv = require('csv');
const turf = require('@turf/turf');

if (!argv.realChangesets || !argv.changesets || !argv.userDetailsDir) {
    console.log('');
    console.log('USAGE: node extract-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --realChangesets   real-changesets/    Directory with real changesets');
    console.log('    --userDetailsDir   user-details/       Directory with user details');
    console.log('    --changesets       changesets.csv      Dump of changesets from osmcha');
    console.log('');
    process.exit(0);
}

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

function objectToString(feature, anotherFeature) {
    let tags = feature ? feature.properties.tags : {};
    let anotherTags = anotherFeature ? anotherFeature.properties.tags : {};

    let toSkipEqual = ['name', 'old_name', 'int_name', 'description', 'note', 'source', 'website', 'wikidata', 'wikipedia', 'email', 'FIXME', 'alt_name', 'phone'];
    let toSkipIn = ['name:', 'tiger:', 'gnis:', 'addr:', 'name_', 'old_name_'];

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
    return results.join(' ');
}

csv.parse(fs.readFileSync(argv.changesets), (error, rows) => {

    let attributes = [];
    attributes.push([
        'changeset_id',
        'changeset_harmful',
        'created',
        'modified',
        'deleted',
        'type_node',
        'type_way',
        'type_relation',
        'line_length',
        'kinks',
        'old_user_mapping_days',
        'new_user_mapping_days',
        'old_tags',
        'new_tags',
    ]);

    let changesets = new Set([]);
    for (let row of rows) {
        let changesetID = row[0];

        // If changeset already seen, skip.
        if (changesets.has(changesetID)) continue;

        let realChangeset;
        try {
            realChangeset = JSON.parse(fs.readFileSync(path.join(argv.realChangesets, changesetID + '.json')));
        } catch (error) {
            // If real changesets does not exist for the changset ID.
            continue;
        }
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');
        let features = featuresCreated.concat(featuresModified, featuresDeleted);

        // Filtering changesets with only one feature touched.
        if (features.length !== 1) continue;
        // if (!((featuresCreated.length === 0) && (featuresModified.length == 1) && (featuresDeleted.length == 0))) continue;

        // Get the only feature in the array.
        let feature = features[0];

        // The first item in the array is new version of feature, second is old version.
        let newVersion = feature[0];
        let oldVersion = feature[1];

        // Filter features that have the highway tag.
        if (!('highway' in newVersion.properties.tags)) continue;

        // Skip changesets from user "chinakz"
        if (newVersion.properties.user === 'chinakz') continue;

        let lineLength = 0;
        try {
            lineLength = turf.lineDistance(newVersion);
        } catch (error) {
            // Nothing to do.
        }

        let kinks = 0;
        try {
            // Number of self-intersection points.
            kinks = turf.kinks(newVersion).features.length;
        } catch(error) {
            // Nothing to do.
        }

        let newUserDetails;
        try {
            newUserDetails = JSON.parse(fs.readFileSync(path.join(argv.userDetailsDir, newVersion.properties.user + '.json')));
        } catch (error) {
            // Nothing to do.
        }

        let oldUserDetails;

        try {
            oldUserDetails = JSON.parse(fs.readFileSync(path.join(argv.userDetailsDir, oldVersion.properties.user + '.json')));
        } catch (error) {
            // Nothing to do.
        }

        changesets.add(changesetID)
        attributes.push([
            changesetID,
            row[1],
            featuresCreated.length,
            featuresModified.length,
            featuresDeleted.length,
            newVersion.properties.type === 'node' ? 1 : 0,
            newVersion.properties.type === 'way' ? 1 : 0,
            newVersion.properties.type === 'relation' ? 1 : 0,
            lineLength,
            kinks,
            oldUserDetails ? oldUserDetails.extra.mapping_days : 0,
            newUserDetails ? newUserDetails.extra.mapping_days : 0,
            objectToString(oldVersion, newVersion),
            objectToString(newVersion, oldVersion),
        ]);
        // console.log(attributes[attributes.length - 1]);
    }

    csv.stringify(attributes, (error, asString) => {
        process.stdout.write(asString);
    });
});
