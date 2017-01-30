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
    expected = [1, 1, 20, 0, 0]
    assert actual == expected
