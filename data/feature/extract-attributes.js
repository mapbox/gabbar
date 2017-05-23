'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const turf = require('@turf/turf');
const parser = require('real-changesets-parser');
const _ = require('underscore');

// Prepare naughty words list.
var NAUGHTY_WORDS = [];
let naughtyWordsLanguages = [
    'ar', 'zh', 'cs', 'da', 'nl', 'en', 'eo', 'fi', 'fr', 'de', 'hi', 'hu', 'it', 'ja', 'tlh', 'ko', 'no',
    'fa', 'pl', 'pt', 'ru', 'es', 'sv', 'th', 'tr'];
for (let naughtyWordsLanguage of naughtyWordsLanguages) {
    NAUGHTY_WORDS = NAUGHTY_WORDS.concat(require('naughty-words/' + naughtyWordsLanguage + '.json'));
}

if (!argv.changesets || !argv.realChangesetsDir || !argv.userDetailsDir) {
    console.log('');
    console.log('USAGE: node extract-attributes.js OPTIONS');
    console.log('');
    console.log('  OPTIONS');
    console.log('    --changesets           changesets.csv      Changesets dump from osmcha');
    console.log('    --realChangesetsDir    real-changesets/    Directory with real changesets');
    console.log('    --userDetailsDir       user-details/       Directory with user details');
    console.log('');
    process.exit(0);
}

let EDITORS = [
    'iD',
    'JOSM',
    'MAPS.ME',
    'Potlatch',
    'Redaction',
    'Vespucci',
    'OsmAnd',
    'Merkaartor',
    'GNOME'  // For amishas157! :wave:
];

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

function getChangesetEditorCounts(realChangeset) {
    // Initilize all counts to zero.
    let counts = [];
    for (let editor of EDITORS) counts.push(0);

    // Extract changeset editor.
    let changesetEditor = '';
    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'created_by') {
            changesetEditor = tag['v'];
            break;
        }
    }
    for (var i = 0; i < EDITORS.length; i++) {
        let editor = EDITORS[i];
        if (changesetEditor.indexOf(editor) !== -1) counts[i] = 1;
    }
    return counts;
}

function getChangesetImageryUsed(realChangeset) {
    let imageryUsed = '';
    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'imagery_used') {
            imageryUsed = tag['v'];
            break;
        }
    }
    return imageryUsed;
}

function getChangesetSource(realChangeset) {
    let source = '';
    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'source') {
            source = tag['v'];
            break;
        }
    }
    return source;
}

function getChangesetComment(realChangeset) {
    let comment = '';
    let tags = realChangeset.metadata.tag;
    for (let tag of tags) {
        if (tag['k'] === 'comment') {
            comment = tag['v'];
            break;
        }
    }
    return comment;
}

function getNaughtyWordsCount(s) {
    let count = 0;
    let words = s.split(' ');
    for (let word of words) {
        if (NAUGHTY_WORDS.indexOf(word) !== -1) count += 1;
    }
    return count;
}

function getBBOXArea(realChangeset) {
    let meta = realChangeset['metadata'];
    let bbox = [meta['min_lat'], meta['min_lon'], meta['max_lat'], meta['max_lon']].map(parseFloat);
    var polygon = turf.bboxPolygon(bbox);
    return parseInt(turf.area(polygon));
}

function checkNonOpenDataSource(sources) {
    let nonOpenDataSources = ['google'];

    for (let source of sources) {
        source = source.toLowerCase();
        for (let nonOpenDataSource of nonOpenDataSources) {
            if (source.indexOf(nonOpenDataSource) !== -1) return true;
        }
    }
    return false;
}

function extractAttributes(row, realChangesetsDir, userDetailsDir, callback) {
    let changesetID = row[0];
    let userName = row[1];
    let harmful = row[15] === 'True' ? 1 : 0;

    let realChangeset = JSON.parse(fs.readFileSync(path.join(realChangesetsDir, changesetID + '.json')));
    let userDetails = JSON.parse(fs.readFileSync(path.join(userDetailsDir, userName + '.json')));
    let changeset = parser(realChangeset);

    let featuresCreated = getFeaturesByAction(changeset, 'create');
    let featuresModified = getFeaturesByAction(changeset, 'modify');
    let featuresDeleted = getFeaturesByAction(changeset, 'delete');
    let allFeatures = featuresCreated.concat(featuresModified, featuresDeleted);

    let changesetEditorCounts = getChangesetEditorCounts(realChangeset);
    let changesetImageryUsed = getChangesetImageryUsed(realChangeset);
    let changesetSource = getChangesetSource(realChangeset);
    let changesetComment = getChangesetComment(realChangeset);
    let changesetCommentNaughtyWordsCount = getNaughtyWordsCount(changesetComment, NAUGHTY_WORDS);
    let nonOpenDataSource = checkNonOpenDataSource([changesetSource, changesetComment, changesetImageryUsed])

    let attributes = [
        changesetID,
        harmful,
        featuresCreated.length,
        featuresModified.length,
        featuresDeleted.length,
        changesetImageryUsed.length ? 1 : 0,
        changesetSource.length ? 1 : 0,
        changesetComment.length > 0 ? changesetComment.split(' ').length : 0,
        changesetCommentNaughtyWordsCount,
        getBBOXArea(realChangeset),
        nonOpenDataSource ? 1 : 0,
    ];
    for (let count of changesetEditorCounts) attributes.push(count);
    console.log(attributes.join(','));
    return callback();
}

let q = queue(1);
csv.parse(fs.readFileSync(argv.changesets), (error, changesets) => {

    let header = [
        'changeset_id',
        'changeset_harmful',
        'changeset_features_created',
        'changeset_features_modified',
        'changeset_features_deleted',
        'changeset_has_imagery_used',
        'changeset_has_source',
        'changeset_comment_number_of_words',
        'changeset_comment_naughty_words_count',
        'changeset_bbox_area',
        'changeset_non_open_data_source',
    ];
    for (let editor of EDITORS) header.push(editor);
    console.log(header.join(','));

    // Starting from the second row, skipping the header.
    for (var i = 1; i < changesets.length; i++) {
        let changeset = changesets[i];
        q.defer(extractAttributes, changeset, argv.realChangesetsDir, argv.userDetailsDir);
    }

    q.awaitAll((error, results) => {
        if (error) console.log(error);
    })
});
