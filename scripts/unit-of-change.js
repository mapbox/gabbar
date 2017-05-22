'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const parser = require('real-changesets-parser');
const _ = require('underscore');
const csv = require('csv');

if (!argv.directory || !argv.changesets) {
    console.log('');
    console.log('USAGE: node unit-of-change.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --directory    training/real-changesets/');
    console.log('    --changesets   changesets.csv');
    console.log('');
    process.exit(0);
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

function getPropertyActions(newVersion, oldVersion) {
    let actions = {
        'create': [],
        'modify': [],
        'delete': []
    };

    for (var tag in newVersion.properties.tags) {
        if (!(tag in oldVersion.properties.tags)) {
            actions.create.push(tag);
        } else if(newVersion.properties.tags[tag] !== oldVersion.properties.tags[tag]) {
            actions.modify.push(tag);
        }
    }

    for (var tag in oldVersion.properties.tags) {
        if (!(tag in newVersion.properties.tags)) {
            actions.delete.push(tag);
        }
    }


    if ((actions['create'].length > 0) || (actions['modify'].length > 0) || (actions['delete'].length > 0)) {
        // console.log(actions);
        // console.log(JSON.stringify(newVersion));
        // console.log(JSON.stringify(oldVersion));
        // process.exit(0);
    }

    return actions;
}

function getCounts(files, harmful) {
    let actions = {'create': {}, 'modify': {}, 'delete': {}};

    let count = 0;
    for (let file of files) {
        if (file === '.DS_Store') continue;
        // If the changeset is not harmful, continue;
        let changesetID = file.split('.')[0];
        // console.log(changesetID);
        // console.log(harmful[changesetID]);
        // process.exit(0);
        if (harmful[changesetID]) continue;

        let realChangeset = JSON.parse(fs.readFileSync(path.join(argv.directory, file)));
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');

        let features = featuresCreated.concat(featuresModified, featuresDeleted);

        for (let feature  of features) {
            let newVersion = feature[0];
            let oldVersion = feature[1];

            // NOTE: At the moment, we are not interested in newly created features.
            if (!oldVersion) continue;

            let properties = oldVersion.properties.tags;
            // NOTE: At the moment, we are interested in highway features only.
            if (!('highway' in properties)) continue;

            let propertyActions = getPropertyActions(newVersion, oldVersion);
            for (let action of Object.keys(propertyActions)) {
                for (let value of propertyActions[action]) {
                    if (!(value in actions[action])) actions[action][value] = 0;
                    actions[action][value] += 1;
                }
            }
        }

        count += 1;
        if (count > 100) break;
    }

    return actions;
}

function getHarmfulStatus(changesetFile, callback) {
    let harmfuls = {};
    csv.parse(fs.readFileSync(changesetFile), (error, rows) => {
        for (var i = 0; i < rows.length; i++) {
            let row = rows[i];
            let changesetID = row[0];
            let harmful = row[15] === 'True';
            harmfuls[changesetID] = harmful;
        }
        return callback(null, harmfuls);
    });
}

getHarmfulStatus(argv.changesets, (error, harmful) => {
    let files = fs.readdirSync(argv.directory);
    let actions = getCounts(files, harmful);

    let results = [];
    for (let action of Object.keys(actions)) {
        for (let type in actions[action]) {
            results.push([action, type, actions[action][type]]);
        }
    }

    csv.stringify(results, (error, resultsAsString) => {
        console.log(resultsAsString);
    });
});
