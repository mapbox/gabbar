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
    console.log('USAGE: node highway-attributes.js OPTIONS');
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

let HIGHWAY_VALUES = [
    'residential',
    'service',
    'track',
    'unclassified',
    'footway',
    'path',
    'tertiary',
    'secondary',
    'crossing',
    'primary',
    'bus_stop',
    'turning_circle',
    'other',
];

let HIGHWAY_COMBINATIONS = [
    'name',
    'source',
    'surface',
    'tiger:cfcc',
    'tiger:county',
    'tiger:reviewed',
    'oneway',
    'tiger:name_base',
    'maxspeed',
    'lanes',
    'tiger:name_type',
    'ref',
    'service',
    'tiger:source',
    'tiger:tlid',
    'tracktype',
    'access',
    'tiger:upload_uuid',
    'yh:WIDTH',
    'tiger:zip_left',
    'tiger:separated',
    'tiger:zip_right',
    'foot',
    'bicycle',
    'yh:TOTYUMONO',
    'yh:WIDTH_RANK',
    'yh:STRUCTURE',
    'yh:TYPE',
    'bridge',
    'layer',
    'lit',
    'crossing',
    'tiger:name_direction_prefix',
    'width',
    'other'
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
    return turf.area(polygon);
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
    return turf.area(feature);
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
    let similars = ['name_', 'landuse_', 'surface_']
    for (let similar of similars) {
        for (let tag in feature.properties.tags) {
            if (tag.toLowerCase().indexOf(similar) !== -1) count += 1;
        }
    }
    return count;
}

function getDaysBetween(date, anotherDate) {
    return moment(date).diff(moment(anotherDate), 'days');
}

function isNamePersonal(feature) {

    let count = 0;
    let personals = ['my', 'home', 'house'];
    let names = ['name', 'name:en'];

    for (let name of names) {
        if (name in feature.properties.tags) {
            for (let personal of personals) {
                let value = feature.properties.tags[name].toLowerCase();
                personal = personal.toLowerCase();
                if (value.indexOf(personal) !== -1) count += 1;
            }
        }
    }
    return count;
}

function getGeometryType(feature) {
    return feature.geometry.type;
}

function getNodeDistances(feature) {
    let distances = [];
    for (var i = 0; i < feature.geometry.coordinates.length - 1; i++) {
        let first = turf.point(feature.geometry.coordinates[i]);
        let second = turf.point(feature.geometry.coordinates[i + 1]);
        distances.push(turf.distance(first, second));
    }
    return distances;
}

function getHighwayValueCounts(feature) {
    let counts = [];

    // Initialize to zero.
    for (let value of HIGHWAY_VALUES) counts.push(0);

    if (!('highway' in feature.properties.tags)) return counts;

    let value = feature.properties.tags.highway;
    if (HIGHWAY_VALUES.indexOf(value) !== -1) counts[HIGHWAY_VALUES.indexOf(value)] = 1;
    else counts[HIGHWAY_VALUES.indexOf('other')] = 1;

    return counts;
}

function getHighwayCombinationCounts(feature) {
    let counts = [];

    // Initialize to zero.
    for (let value of HIGHWAY_COMBINATIONS) counts.push(0);

    for (var tag in feature.properties.tags) {
        if (HIGHWAY_COMBINATIONS.indexOf(tag) !== -1) counts[HIGHWAY_COMBINATIONS.indexOf(tag)] += 1
        else counts[HIGHWAY_COMBINATIONS.indexOf('other')] += 1
    }

    return counts;
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
        // if (realChangeset.metadata.id === '48745375') console.log(JSON.stringify(changeset));


        let featuresCreated = getFeaturesByAction(changeset, 'create');
        let featuresModified = getFeaturesByAction(changeset, 'modify');
        let featuresDeleted = getFeaturesByAction(changeset, 'delete');
        let features = featuresCreated.concat(featuresModified, featuresDeleted);

        let changesetEditorCounts = getChangesetEditorCounts(realChangeset);
        for (let versions of features) {
            let newVersion = versions[0];

            // We are intersted only in highway features.
            if (!('highway' in newVersion.properties.tags)) continue;

            // Skipping due to http://www.openstreetmap.org/user_blocks/1147
            if (newVersion.properties.user === 'chinakz') continue;

            let userName = newVersion.properties['user'];
            let userDetails = JSON.parse(fs.readFileSync(path.join(userDetailsDir, userName + '.json')));

            let action = newVersion.properties.action;
            let primaryTagsCount = getPrimaryTagsCount(newVersion);

            let lineDistance;
            try {
                lineDistance = turf.lineDistance(newVersion);
            } catch (error) {
                lineDistance = 0;
            }

            let distance;
            try {
                distance = turf.distance(
                    turf.point(newVersion.geometry.coordinates[0]),
                    turf.point(newVersion.geometry.coordinates[newVersion.geometry.coordinates.length - 1])
                );
            } catch (error) {
                distance = 0;
            }

            let nodeDistances = [];
            try {
                nodeDistances = getNodeDistances(newVersion);
            } catch (error) {
                // Nothing do to here.
            }

            let kinks = turf.featureCollection([]);
            try {
                kinks = turf.kinks(newVersion);
            } catch (error) {
                // Nothing to do here.
            }

            let feature_area = 0;
            try {
                feature_area = turf.area(turf.bboxPolygon(turf.bbox(newVersion)));
            } catch (error) {
                // Nothing to do here.
            }

            let attributes = [
                changesetID,
                harmful,
                getBBOXArea(realChangeset),
                userDetails['changeset_count'],
                userDetails['num_changes'],
                userDetails['extra']['mapping_days'],
                getDaysBetween(newVersion.properties.timestamp, userDetails.first_edit),
                action === 'create' ? 1 : 0,
                action === 'modify' ? 1 : 0,
                action === 'delete' ? 1 : 0,
                parseInt(newVersion.properties.version),
                Object.keys(newVersion.properties.tags).length,
                isNamePersonal(newVersion),
                getNumberOfSimilarTags(newVersion),
                getGeometryType(newVersion) === 'Point' ? 1 : 0,
                getGeometryType(newVersion) === 'LineString' ? 1 : 0,
                getGeometryType(newVersion) === 'Polygon' ? 1 : 0,
                distance,
                lineDistance,
                getGeometryType(newVersion) === 'Point' ? 1 : turf.getCoords(newVersion.geometry.coordinates).length,
                nodeDistances.length > 0 ? simpleStatistics.mean(nodeDistances) : 0,
                nodeDistances.length > 0 ? simpleStatistics.standardDeviation(nodeDistances) : 0,
                kinks.features.length,
                feature_area,
                getFeatureNameNaughtyWordsCount(getFeatureNameTranslations(newVersion))
            ];
            for (let count of changesetEditorCounts) attributes.push(count);
            for (let count of primaryTagsCount) attributes.push(count);
            for (let count of getHighwayValueCounts(newVersion)) attributes.push(count);
            for (let count of getHighwayCombinationCounts(newVersion)) attributes.push(count);
            console.log(attributes.join(','));
        }
    } catch (error) {
        // NOTE: Nothing to do here.
        // throw (error)
    }
    return callback();
}

let q = queue(1);
csv.parse(fs.readFileSync(argv.changesets), (error, changesets) => {

    let header = [
        'changeset_id',
        'changeset_harmful',
        'changeset_bbox_area',
        'user_changesets',
        'user_features',
        'user_mapping_days',
        'user_days_since_first_edit',
        'feature_action_create',
        'feature_action_modify',
        'feature_action_delete',
        'feature_version',
        'feature_total_tags',
        'feature_personal_count',
        'feature_similar_tags_count',
        'feature_point',
        'feature_linestring',
        'feature_polygon',
        'feature_distance',
        'feature_line_distance',
        'feature_node_count',
        'feature_node_distance_mean',
        'feature_node_distance_stddev',
        'feature_kinks',
        'feature_area',
        'feature_name_profanity',
    ];
    for (let editor of EDITORS) header.push(editor);
    for (let tag of PRIMARY_TAGS) header.push(tag);
    for (let value of HIGHWAY_VALUES) header.push(value);
    for (let value of HIGHWAY_COMBINATIONS) header.push(value);
    console.log(header.join(','));

    let set = new Set([]);

    // Starting from the second row, skipping the header.
    for (var i = 1; i < changesets.length; i++) {
        let changeset = changesets[i];

        // Skip duplicate changesets.
        if (set.has(changeset[0])) continue;
        set.add(changeset[0]);

        q.defer(extractAttributes, changeset, argv.realChangesetsDir, argv.userDetailsDir);
    }

    q.awaitAll((error, results) => {
        if (error) throw (error);
    })
});
