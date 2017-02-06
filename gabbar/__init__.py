# gabbar


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
    features = ["create", "modify", "delete"]
    data = []
    for feature in features:
        data.append(changeset[feature])
    return data

def load_model():
    return joblib.load('models/gabbar.pkl')

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
