#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar

# Number of decimals of accuracy for testing equality.
NUMBER_OF_DECIMALS = 3


def test_get_features():
    changeset_id = u'47734592'
    # TODO: This is too non-verbose. Not scalable!!!
    expected = {"changeset_id": "47734592", "features_created": 1, "features_modified": 0, "features_deleted": 0, "user_id": 5662807, "user_name": "Bhuvan Anand", "user_first_edit": "1492071806", "user_changesets": 1, "user_features": 1, "bbox_area": 0, "changeset_editor": "iD", "node_count": 1, "way_count": 0, "relation_count": 0, "property_modifications": 0, "geometry_modifications": 0, "feature_version_new": 1, "feature_version_low": 0, "feature_version_medium": 0, "feature_version_high": 0, "changeset_editor_iD": 1, "changeset_editor_JOSM": 0, "changeset_editor_MAPS.ME": 0, "changeset_editor_Potlatch": 0, "changeset_editor_Redaction bot": 0, "changeset_editor_Vespucci": 0, "changeset_editor_OsmAnd": 0, "changeset_editor_Merkaartor": 0, "changeset_editor_gnome": 0, "changeset_editor_other": 0, "aerialway": 0, "aeroway": 0, "amenity": 1, "barrier": 0, "boundary": 0, "building": 0, "craft": 0, "emergency": 0, "geological": 0, "highway": 0, "historic": 0, "landuse": 0, "leisure": 0, "man_made": 0, "military": 0, "natural": 0, "office": 0, "place": 0, "power": 0, "public_transport": 0, "railway": 0, "route": 0, "shop": 0, "sport": 0, "tourism": 0, "waterway": 0}
    actual = gabbar.get_features(changeset_id)
    assert json.dumps(actual, sort_keys=True) == json.dumps(expected, sort_keys=True)

def test_filter_features():
    features = {"changeset_id": "47734592", "features_created": 1, "features_modified": 0, "features_deleted": 0, "user_id": 5662807, "user_name": "Bhuvan Anand", "user_first_edit": "1492071806", "user_changesets": 1, "user_features": 1, "bbox_area": 0, "changeset_editor": "iD", "node_count": 1, "way_count": 0, "relation_count": 0, "property_modifications": 0, "geometry_modifications": 0, "feature_version_new": 1, "feature_version_low": 0, "feature_version_medium": 0, "feature_version_high": 0, "changeset_editor_iD": 1, "changeset_editor_JOSM": 0, "changeset_editor_MAPS.ME": 0, "changeset_editor_Potlatch": 0, "changeset_editor_Redaction bot": 0, "changeset_editor_Vespucci": 0, "changeset_editor_OsmAnd": 0, "changeset_editor_Merkaartor": 0, "changeset_editor_gnome": 0, "changeset_editor_other": 0, "aerialway": 0, "aeroway": 0, "amenity": 1, "barrier": 0, "boundary": 0, "building": 0, "craft": 0, "emergency": 0, "geological": 0, "highway": 0, "historic": 0, "landuse": 0, "leisure": 0, "man_made": 0, "military": 0, "natural": 0, "office": 0, "place": 0, "power": 0, "public_transport": 0, "railway": 0, "route": 0, "shop": 0, "sport": 0, "tourism": 0, "waterway": 0}
    expected = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    actual = gabbar.filter_features(features)
    print(json.dumps(actual))

    for i, item in enumerate(expected):
        assert actual[i] == expected[i]

    for i, item in enumerate(actual):
        assert actual[i] == expected[i]

def test_normalize_features():
    features = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    expected = [1.0, 0.0, 0.0, 1.0, -0.031759025332264254, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.16666666666666666, 0.0, -0.14285714285714285, -0.14285714285714285, 0.0, -0.2, 0.0, 0.3333333333333333, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.15, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.1257359125315391, -0.037411378145639385, 0.0, -0.2]
    actual = gabbar.normalize_features(features)

    for i, item in enumerate(expected):
        assert round(actual[i], NUMBER_OF_DECIMALS) == round(expected[i], NUMBER_OF_DECIMALS)

    for i, item in enumerate(actual):
        assert round(actual[i], NUMBER_OF_DECIMALS) == round(expected[i], NUMBER_OF_DECIMALS)

def test_get_prediction():
    normalized_features = [1.0, 0.0, 0.0, 1.0, -0.031759025332264254, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.16666666666666666, 0.0, -0.14285714285714285, -0.14285714285714285, 0.0, -0.2, 0.0, 0.3333333333333333, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.15, 0.0, 0.0, 0.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.1257359125315391, -0.037411378145639385, 0.0, -0.2]
    expected = 1
    actual = gabbar.get_prediction(normalized_features)
    assert actual == expected
