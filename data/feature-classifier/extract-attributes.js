'use strict';

const argv = require('minimist')(process.argv.slice(2));
const csv = require('csv');
const path = require('path');
const fs = require('fs');
const queue = require('d3-queue').queue;
const turf = require('@turf/turf');
const parser = require('real-changesets-parser');
const _ = require('underscore');
const moment = require('moment');
const osmCompare = require('@mapbox/osm-compare');
const simpleStatistics = require('simple-statistics');

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

// Prepare naughty words list.
var NAUGHTY_WORDS = [];
let naughtyWordsLanguages = [
    'ar', 'zh', 'cs', 'da', 'nl', 'en', 'eo', 'fi', 'fr', 'de', 'hi', 'hu', 'it', 'ja', 'tlh', 'ko', 'no',
    'fa', 'pl', 'pt', 'ru', 'es', 'sv', 'th', 'tr'];
for (let naughtyWordsLanguage of naughtyWordsLanguages) {
    NAUGHTY_WORDS = NAUGHTY_WORDS.concat(require('naughty-words/' + naughtyWordsLanguage + '.json'));
}

var PRIMARY_TAGS = [
    'aerialway',
    'aeroway',
    'amenity',
    'barrier',
    'boundary',
    'building',
    'craft',
    'emergency',
    'geological',
    'highway',
    'historic',
    'landuse',
    'leisure',
    'man_made',
    'military',
    'natural',
    'office',
    'place',
    'power',
    'public_transport',
    'railway',
    'route',
    'shop',
    'sport',
    'tourism',
    'waterway'
];

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
        if (NAUGHTY_WORDS.indexOf(word.toLowerCase()) !== -1) count += 1;
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

function getFeatureVersion(feature) {
    let newVersion = feature[0];
    return newVersion.properties.version;
}

function getFeatureNameTranslations(feature) {
    let translations = [];
    for (var tag in feature.properties.tags) {
        if (tag.indexOf('name') !== -1) translations.push(feature.properties.tags[tag]);
    }
    return translations;
}

function getDaysSinceLastEdit(feature) {
    let newVersion = feature[0];
    let oldVersion = feature[1];

    return moment(newVersion.properties.timestamp).diff(moment(oldVersion.properties.timestamp), 'days');
}

function getPrimaryTags(feature) {
    let primaryTags = [];
    for (var tag in feature.properties.tags) {
        if (PRIMARY_TAGS.indexOf(tag) !== -1) primaryTags.push(tag);
    }
    return primaryTags;
}

function getPrimaryTagsCount(feature) {
    // Initialize counts to 0.
    let counts = [];
    for (let tag of PRIMARY_TAGS) counts.push(0);

    for (var tag in feature.properties.tags) {
        if (PRIMARY_TAGS.indexOf(tag) !== -1) {
            let popularities = require('@mapbox/osm-compare/common_tag_values/' + tag + '.json');

            for (let item of popularities.data) {
                if (item.value === feature.properties.tags[tag]) {
                    let fraction = item.fraction * 100;  // Converting into a percentage.
                    counts[PRIMARY_TAGS.indexOf(tag)] = fraction;
                }
            }

        }
    }
    return counts;
}

function getFeatureArea(feature) {
    return parseInt(turf.area(feature));
}

function getTagsCreated(feature) {
    let tags = [];
    let newVersionTags = feature[0].properties.tags;
    let oldVersionTags = feature[1].properties.tags;

    for (var tag in newVersionTags) {
        if (!(tag in oldVersionTags)) tags.push(tag);
    }
    return tags;
}

function getTagsModified(feature) {
    let tags = [];
    let newVersionTags = feature[0].properties.tags;
    let oldVersionTags = feature[1].properties.tags;

    for (var tag in newVersionTags) {
        if ((tag in oldVersionTags) && (newVersionTags[tag] !== oldVersionTags[tag])) tags.push(tag);
    }
    return tags;
}

function getTagsDeleted(feature) {
    let tags = [];
    let newVersionTags = feature[0].properties.tags;
    let oldVersionTags = feature[1].properties.tags;

    for (var tag in oldVersionTags) {
        if (!(tag in newVersionTags)) tags.push(tag);
    }
    return tags;
}

function getSpecialCharactersCount(s) {
    let count = 0;
    let specials = '0123456789~`!#$%^&*+=-[]\\\';,/{}|\":<>?';
    for (let character of s) {
        if (specials.indexOf(character) !== -1) count += 1;
    }
    return count;
}

function getFeatureNameNaughtyWordsCount(translations){
    let count = 0;
    for (let translation of translations) {
        count += getNaughtyWordsCount(translation);
    }
    return count;
}

function getPrimaryTagValuesPopularity(feature) {
    let primaryTags = getPrimaryTags(feature);

    let popularity = [];
    for (let primaryTag of primaryTags) {
        let primaryTagValue = feature.properties.tags[primaryTag];
        let popularities = require('@mapbox/osm-compare/common_tag_values/' + primaryTag + '.json');
        for (let item of popularities.data) {
            if (item.value === primaryTagValue) {
                popularity.push(item.fraction);
            }
        }
    }
    let min = parseFloat(simpleStatistics.min(popularity).toFixed(4));
    let max = parseFloat(simpleStatistics.max(popularity).toFixed(4));
    let mean = parseFloat(simpleStatistics.mean(popularity).toFixed(4));
    let stddev = parseFloat(simpleStatistics.standardDeviation(popularity).toFixed(4));
    return [min, max, mean, stddev];
}

function getNumberOfSimilarTags(feature) {
    let count = 0;
    let tags = Object.keys(feature.properties.tags);
    let primaryTags = getPrimaryTags(feature);

    for (var i = 0; i < tags.length; i++) {
        for (var j = 0; j < tags.length; j++) {
            if (i === j) continue;

            let isPrimaryTag = false;
            for (let primaryTag of primaryTags) {
                if ((tags[i].indexOf(primaryTag) !== -1) && (tags[j].indexOf(primaryTag) !== -1)) {
                    isPrimaryTag = true;
                    break;
                }
            }
            if (isPrimaryTag && ((tags[i].indexOf('_') !== -1) || (tags[j].indexOf('_') !== -1)) && ((tags[i].indexOf(tags[j]) !== -1) || (tags[j].indexOf(tags[i]) !== -1))) count += 1;
        }
    }

    // Things are counted twice, so divide by 2.
    count = count / 2;
    return count;
}

function extractAttributes(row, realChangesetsDir, userDetailsDir, callback) {
    try {
        let changesetID = row[0];

        // Handle case when changeset is not reviewed.
        let harmful = '';
        if (row[15] === 'True') harmful = 1;
        else if (row[15] === 'False') harmful =0;

        let realChangeset = JSON.parse(fs.readFileSync(path.join(realChangesetsDir, changesetID + '.json')));
        let changeset = parser(realChangeset);

        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');
        let features = featuresCreated.concat(featuresModified, featuresDeleted);

        let changesetEditorCounts = getChangesetEditorCounts(realChangeset);
        let changesetImageryUsed = getChangesetImageryUsed(realChangeset);
        let changesetSource = getChangesetSource(realChangeset);
        let changesetComment = getChangesetComment(realChangeset);
        let changesetCommentNaughtyWordsCount = getNaughtyWordsCount(changesetComment, NAUGHTY_WORDS);
        let nonOpenDataSource = checkNonOpenDataSource([changesetSource, changesetComment, changesetImageryUsed]);

        for (let feature of features) {
            let userName = feature[0].properties['user'];
            let userDetails = JSON.parse(fs.readFileSync(path.join(userDetailsDir, userName + '.json')));

            let oldUserName = feature[1].properties['user'];
            let oldUserDetails = JSON.parse(fs.readFileSync(path.join(userDetailsDir, oldUserName + '.json')));

            let featureNameTranslations = getFeatureNameTranslations(feature[0]);
            let featureDaysSinceLastEdit = getDaysSinceLastEdit(feature);
            let primaryTags = getPrimaryTags(feature[0]);
            let primaryTagsCount = getPrimaryTagsCount(feature[0]);
            let tagValuesPopularity = getPrimaryTagValuesPopularity(feature[0]);

            let tagsCreated = getTagsCreated(feature);
            let tagsModified = getTagsModified(feature);
            let tagsDeleted = getTagsDeleted(feature);

            let featureNameTranslationsOld = getFeatureNameTranslations(feature[1]);
            let primaryTagsOld = getPrimaryTags(feature[1]);
            let primaryTagsCountOld = getPrimaryTagsCount(feature[1]);
            let similarTagsCountOld = getNumberOfSimilarTags(feature[1]);

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
                getSpecialCharactersCount(changesetComment),
                getNaughtyWordsCount(userName),
                getSpecialCharactersCount(userName),
                userDetails['changeset_count'],
                userDetails['num_changes'],
                userDetails['extra']['mapping_days'],
                userDetails['extra']['total_discussions'],
                userDetails['extra']['changesets_with_discussions'],
                getNaughtyWordsCount(oldUserName),
                getSpecialCharactersCount(oldUserName),
                oldUserDetails['changeset_count'],
                oldUserDetails['num_changes'],
                oldUserDetails['extra']['mapping_days'],
                oldUserDetails['extra']['total_discussions'],
                oldUserDetails['extra']['changesets_with_discussions'],
                getFeatureVersion(feature),
                getFeatureNameNaughtyWordsCount(featureNameTranslations),
                featureDaysSinceLastEdit,
                primaryTags.length,
                getFeatureArea(feature[0]),
                Object.keys(feature[0].properties.tags).length,
                featureNameTranslations.length,
                feature[0].properties.tags.website ? 1 : 0,
                feature[0].properties.tags.wikidata ? 1 : 0,
                feature[0].properties.tags.wikipedia ? 1 : 0,
                tagsCreated.length,
                tagsModified.length,
                tagsDeleted.length,
                tagsCreated.length + tagsModified.length + tagsDeleted.length,
                getNumberOfSimilarTags(feature[0]),
                getFeatureNameNaughtyWordsCount(featureNameTranslationsOld),
                primaryTagsOld.length,
                getFeatureArea(feature[1]),
                Object.keys(feature[1].properties.tags).length,
                featureNameTranslationsOld.length,
                feature[1].properties.tags.website ? 1 : 0,
                feature[1].properties.tags.wikidata ? 1 : 0,
                feature[1].properties.tags.wikipedia ? 1 : 0,
                getNumberOfSimilarTags(feature[1]),
            ];
            for (let count of changesetEditorCounts) attributes.push(count);
            for (let count of primaryTagsCount) attributes.push(count);
            for (let count of primaryTagsCountOld) attributes.push(count);
            for (let count of tagValuesPopularity) attributes.push(count);

            console.log(attributes.join(','));
        }
    } catch (error) {
        // NOTE: Nothing to do here.
    }
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
        'changeset_comment_special_characters_count',
        'user_name_naughty_words_count',
        'user_name_special_characters_count',
        'user_changesets_count',
        'user_features_count',
        'user_mapping_days_count',
        'user_discussions_count',
        'user_changesets_with_discussions_count',
        'old_user_name_naughty_words_count',
        'old_user_name_special_characters_count',
        'old_user_changesets_count',
        'old_user_features_count',
        'old_user_mapping_days_count',
        'old_user_discussions_count',
        'old_user_changesets_with_discussions_count',
        'feature_version',
        'feature_name_naughty_words_count',
        'feature_days_since_last_edit',
        'feature_primary_tags',
        'feature_area',
        'feature_property_tags',
        'feature_name_translations_count',
        'feature_has_website',
        'feature_has_wikidata',
        'feature_has_wikipedia',
        'feature_tags_created_count',
        'feature_tags_modified_count',
        'feature_tags_deleted_count',
        'feature_tags_distance',
        'feature_similar_tags_count',
        'feature_name_naughty_words_count_old',
        'feature_primary_tags_old',
        'feature_area_old',
        'feature_property_tags_old',
        'feature_name_translations_count_old',
        'feature_has_website_old',
        'feature_has_wikidata_old',
        'feature_has_wikipedia_old',
        'feature_similar_tags_count_old',
    ];
    for (let editor of EDITORS) header.push(editor);
    for (let tag of PRIMARY_TAGS) header.push(tag);
    for (let tag of PRIMARY_TAGS) header.push(tag + '_old');
    for (let tag of ['tag_values_popularity_min', 'tag_values_popularity_max', 'tag_values_popularity_mean', 'tag_values_popularity_stddev']) header.push(tag);
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
