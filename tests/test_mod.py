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


def test_predict():
    # Modifying 406 features in a changeset is problematic
    data = [[0, 406, 0]]
    model = gabbar.load_model()
    actual = gabbar.predict(model, data)
    # Note: -1 for outlier, +1 for inlier
    expected = -1
    assert actual == expected
