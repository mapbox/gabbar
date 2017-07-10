#!/usr/bin/env node
'use strict';


const argv = require('minimist')(process.argv.slice(2));
const request = require('request');
const parser = require('real-changesets-parser');
const hFilters = require('../filters/highway');
const hAttributes = require('../attributes/highway');
const fAttributes = require('../attributes/feature');


if (argv.changesetID) {
    // let data = {
    //     'header': ['changeset_id', 'changeset_harmful', 'feature_id', 'feature_version', 'action_create', 'action_modify', 'action_delete', 'geometry_type_node', 'geometry_type_way', 'geometry_type_relation', 'geometry_line_distance', 'geometry_kinks', 'old_user_mapping_days', 'new_user_mapping_days', 'old_tags', 'new_tags'],
    //     'attributes': [
    //         ['48255884', 0, '490324518', 2, 0, 1, 0, 0, 1, 0, 0.33, 0, 27, 27, '', '{landuse=forest}']
    //     ]
    // };

    let data = {
        'header': hAttributes.getAttributeHeaders(),
        'attributes': []
    };
    downloadRealChangeset(argv.changesetID)
        .then(realChangeset => {
            let changeset = parser(realChangeset);

            let samples = hFilters.getSamples(changeset);
            if (samples.length === 0) console.log(JSON.stringify(data));

            for (let sample of samples) {
                let newVersion = sample[0];
                let oldVersion = sample[1];

                let attributes = hAttributes.getAttributes(realChangeset, changeset, newVersion, oldVersion);
                data.attributes.push(attributes);

                // TODO: Cannot return here when there are multiple samples.
                console.log(JSON.stringify(data));

                    // });
            }
        })
        .catch(error => {
            throw error;
        });
}


function downloadRealChangeset(changesetID) {
    return new Promise((resolve, reject) => {
        let url = `https://s3.amazonaws.com/mapbox/real-changesets/production/${changesetID}.json`;
        request.get(url, (error, response, body) => {
            if (error || response.statusCode !== 200) return resolve({});
            else return resolve(JSON.parse(body));
        });
    });
}


function downloadUserDetails(userID, userDetails) {
    return new Promise((resolve, reject) => {
        try {
            let url = 'https://osm-comments-api.mapbox.com/api/v1/users/id/' + userID;
            request.get(url, (error, response, body) => {
                if (error || response.statusCode !== 200) return resolve({});
                else return resolve(JSON.parse(body));
            });
        } catch (error) {
            return resolve({});
        }
    });
}
