# autovandal


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
    return [changeset[feature] for feature in features]


def load_model():
    return joblib.load('models/autovandal.pkl')

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
