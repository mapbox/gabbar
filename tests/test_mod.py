#!/usr/bin/python
# -*- coding: utf-8 -*-

import json

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
    changeset_id = 47734592
    expected = '''{"elements":[{"id":"4791320695","lat":"12.9233976","lon":"77.4835478","version":"1","timestamp":"2017-04-13T08:23:26Z","changeset":"47734592","uid":"5662807","user":"Bhuvan Anand","action":"create","type":"node","tags":{"addr:city":"à²¸à³à²­à²¾à²·à³ à²¨à²à²°, à²à³à²à²à³à²°à²¿ à²à²ªà²¨à²à²°","addr:postcode":"à³«à³¬à³¦à³¦à³¬à³¦","addr:street":"à³­ à²¨à³ à²à³à²°à²¾à²¸à³","amenity":"place_of_worship","name":"à²¶à³à²°à³ à²°à²¾à²à²µà³à²à²¦à³à²° à²¸à³à²µà²¾à²®à²¿ à²®à² "}}],"metadata":{"id":"47734592","created_at":"2017-04-13T08:23:26Z","closed_at":"2017-04-13T08:23:27Z","open":"false","user":"Bhuvan Anand","uid":"5662807","min_lat":"12.9233976","min_lon":"77.4835478","max_lat":"12.9233976","max_lon":"77.4835478","comments_count":"0","tag":[{"k":"comment","v":"à²¶à³à²°à³ à²°à²¾à²à²µà³à²à²¦à³à²° à²¸à³à²µà²¾à²®à²¿ à²®à² à²µà²¨à³à²¨à³  à²¨à²à³à²·à³à²¯à²²à³à²²à²¿ à²à³à²°à³à²¤à²¿à²¸à²²à²¾à²à²¿à²¦à³. "},{"k":"locale","v":"kn"},{"k":"host","v":"http://www.openstreetmap.org/id"},{"k":"imagery_used","v":"Bing aerial imagery"},{"k":"created_by","v":"iD 2.1.3"}]}}'''
    actual = gabbar.download_changeset(changeset_id)
    assert actual == json.loads(expected)
