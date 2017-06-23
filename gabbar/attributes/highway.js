'use strict';

module.exports = {
    tagsToString: tagsToString
};


function tagsToString(feature, anotherFeature) {
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
