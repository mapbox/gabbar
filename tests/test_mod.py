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
    expected = [changeset_id, 1, 0, 0, 5662807, "Bhuvan Anand", "2017-04-13T08:23:26.000Z", 1, 1, 0, "iD", 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    actual = gabbar.get_features(changeset_id)
    assert json.dumps(actual) == json.dumps(expected)

def test_filter_features():
    features = ['47734592', 1, 0, 0, 5662807, "Bhuvan Anand", "2017-04-13T08:23:26.000Z", 1, 1, 0, "iD", 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
