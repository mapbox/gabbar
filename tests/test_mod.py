#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar

# def test_changeset_to_data():
#     changeset = {
#         "ID": 44581855,
#         "create": 20,
#         "modify": 0,
#         "delete": 0
#     }
#     actual = gabbar.changeset_to_data(changeset)
#     expected = [20, 0, 0]
#     assert actual == expected
#
# def test_predict_problematic():
#     # Modifying 500 features in a changeset is problematic
#     data = [[0, 500, 0]]
#     model = gabbar.load_model()
#     actual = gabbar.predict(model, data)
#     expected = -1  # -1 for outlier.
#     assert actual == expected
#
# def test_predict_not_problematic():
#     # Modifying 5 features in a changeset is not problematic
#     data = [[0, 5, 0]]
#     model = gabbar.load_model()
#     actual = gabbar.predict(model, data)
#     expected = 1  # +1 for inlier.
#     assert actual == expected
#
# def test_get_features():
#     changeset_id = u'47734592'
#     expected = [changeset_id, 1, 0, 0]
#     actual = gabbar.get_features(changeset_id)
#     assert json.dumps(actual) == json.dumps(expected)
#
# def test_normalize_features():
#     features = [1, 0, 0]
#
#     expected = [-0.0714, 0, -0.25]
#     actual = gabbar.normalize_features(features)
#
#     for i, item in enumerate(expected):
#         assert round(actual[i], 4) == expected[i]
#
# def test_filter_features():
#     features = ['47734592', 1, 0, 0]
#     expected = [1, 0, 0]
#     actual = gabbar.filter_features(features)
#     for i, item in enumerate(expected):
#         assert actual[i] == expected[i]
#
# def test_get_prediction():
#     normalized_features = [-0.0714, 0, -0.25]
#     expected = 1
#     actual = gabbar.get_prediction(normalized_features)
#     assert actual == expected
