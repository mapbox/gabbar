import autovandal


def test_has_legs():
    assert not autovandal.has_legs


def test_changeset_to_data():
    changeset = {
        "ID": 44581855,
        "editor": "iD 2.0.1",
        "source": "Not reported",
        "create": 20,
        "modify": 0,
        "delete": 0
    }
    actual = autovandal.changeset_to_data(changeset)
    expected = [8, 12, 20, 0, 0]
    assert actual == expected


def test_predict():
    # Creating 500 features in a changeset is problematic
    data = [[0, 0, 500.0, 0.0, 0.0]]
    model = autovandal.load_model()
    actual = autovandal.predict(model, data)
    # Note: -1 for outlier, +1 for inlier
    expected = -1
    assert actual == expected
