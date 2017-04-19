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
    real_changeset = gabbar.download_changeset(changeset_id)
    assert real_changeset['metadata']['id'] == changeset_id

def test_extract_features():
    changeset_id = '47930725'
    directory = os.path.dirname(os.path.realpath(__file__))
    filepath = os.path.join(directory, 'real_changesets/{}.json'.format(changeset_id))
    with open(filepath) as f:
        real_changeset = json.loads(f.read())

    expected = {
        'changeset_id': changeset_id,
        'created': 2,
        'modified': 2,
        'deleted': 2
    };
    actual = gabbar.extract_features(real_changeset)

    assert expected['changeset_id'] == actual['changeset_id']
    assert expected['created'] == actual['created']
    assert expected['modified'] == actual['modified']
    assert expected['deleted'] == actual['deleted']
