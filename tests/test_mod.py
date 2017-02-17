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
    # Numbers using the script `training/test-model.py`
    data = [[101, 82, 7]]
    model = gabbar.load_model()
    actual = gabbar.predict(model, data)
    expected = True
    assert actual == expected

def test_predict_not_problematic():
    # Numbers using the script `training/test-model.py`
    data = [[0, 5, 0]]
    model = gabbar.load_model()
    actual = gabbar.predict(model, data)
    expected = False
    assert actual == expected
