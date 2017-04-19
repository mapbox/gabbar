#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import os

import gabbar


def test_has_legs():
    assert not gabbar.has_legs

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

def test_download_changeset():
    changeset_id = '47734592'
    actual = gabbar.download_changeset(changeset_id)
    assert actual['metadata']['id'] == changeset_id
