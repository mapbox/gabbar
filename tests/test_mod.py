#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar

def test_get_features():
    changeset_id = u'47734592'
    expected = [changeset_id, 1, 0, 0]
    actual = gabbar.get_features(changeset_id)
    assert json.dumps(actual) == json.dumps(expected)

def test_normalize_features():
    features = [1, 0, 0]

    expected = [-0.0714, 0, -0.25]
    actual = gabbar.normalize_features(features)

    for i, item in enumerate(expected):
        assert round(actual[i], 4) == expected[i]

def test_filter_features():
    features = ['47734592', 1, 0, 0]
    expected = [1, 0, 0]
    actual = gabbar.filter_features(features)
    for i, item in enumerate(expected):
        assert actual[i] == expected[i]

def test_get_prediction():
    normalized_features = [-0.0714, 0, -0.25]
    expected = 1
    actual = gabbar.get_prediction(normalized_features)
    assert actual == expected
