#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar

def test_changeset_to_data():
    changeset = {
        "ID": 44581855,
        "create": 20,
        "modify": 0,
        "delete": 0
    }
    actual = gabbar.changeset_to_data(changeset)
    expected = [20, 0, 0]
    assert actual == expected

def test_predict_problematic():
    # Modifying 500 features in a changeset is problematic
    data = [[0, 500, 0]]
    model = gabbar.load_model()
    actual = gabbar.predict(model, data)
    expected = -1  # -1 for outlier.
    assert actual == expected

def test_predict_not_problematic():
    # Modifying 5 features in a changeset is not problematic
    data = [[0, 5, 0]]
    model = gabbar.load_model()
    actual = gabbar.predict(model, data)
    expected = 1  # +1 for inlier.
    assert actual == expected

def test_extract_features():
    changeset_id = '47734592'
    expected = {
        'changeset_id': changeset_id,
        'features_created': 1,
        'features_modified': 0,
        'features_deleted': 0,
    }
    actual = gabbar.extract_features(changeset_id)

    for key in expected:
        assert actual[key] == expected[key]
