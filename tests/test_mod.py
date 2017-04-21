#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar

# Number of decimals of accuracy for testing equality.
NUMBER_OF_DECIMALS = 3


def test_get_features():
    changeset_id = u'47734592'
    expected = [changeset_id, 1, 0, 0, 5662807, 'Bhuvan Anand', '2017-04-13T08:23:26.000Z', 1, 1]
    actual = gabbar.get_features(changeset_id)
    assert json.dumps(actual) == json.dumps(expected)

def test_normalize_features():
    features = [1, 0, 0, 1, 1]

    expected = [-0.07142857, 0, -0.2, -0.12587609, -0.03724068]
    # expected = [1, 0, 0, 1, 1]
    actual = gabbar.normalize_features(features)
    print(actual)

    for i, item in enumerate(expected):
        assert round(actual[i], NUMBER_OF_DECIMALS) == round(expected[i], NUMBER_OF_DECIMALS)

    for i, item in enumerate(actual):
        assert round(actual[i], NUMBER_OF_DECIMALS) == round(expected[i], NUMBER_OF_DECIMALS)

def test_filter_features():
    features = ['47734592', 1, 0, 0, 5662807, 'Bhuvan Anand', '2017-04-13T08:23:26.000Z', 1, 1]
    expected = [1, 0, 0, 1, 1]

    actual = gabbar.filter_features(features)

    for i, item in enumerate(expected):
        assert actual[i] == expected[i]

    for i, item in enumerate(actual):
        assert actual[i] == expected[i]

def test_get_prediction():
    normalized_features = [-0.07142857, 0, -0.2, -0.12587609, -0.03724068]
    expected = 1
    actual = gabbar.get_prediction(normalized_features)
    assert actual == expected
