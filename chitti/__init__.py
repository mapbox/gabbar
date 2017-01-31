# chitti


from sklearn import svm
from sklearn.externals import joblib


has_legs = False


def changeset_to_data(changeset):
    """Convert changeset object into data array.

    Parameters
    ----------
    changeset: dict

    Returns
    -------
    data: tuple
        Tuple of data items
    """
    features = ["editor", "source", "create", "modify", "delete"]
    data = []
    for feature in features:
        # Convert a string to a numberical value using it's length
        if isinstance(changeset[feature], str):
            data.append(len(changeset[feature]))
        else:
            data.append(changeset[feature])
    return data

def load_model():
    return joblib.load('models/chitti.pkl')

def predict(model, data):
    """Returns model prediction for data.

    Parameters
    ----------
    model: object
        Trained machine learning classifier
    data: tuple
        Tuple of data items
    Returns
    -------
    prediction: int
        -1 for outlier, +1 for inlier
    """
    prediction = model.predict(data)
    return prediction[0]
