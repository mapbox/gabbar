# gabbar


from sklearn import svm
from sklearn.externals import joblib
import os

has_legs = False

def changeset_to_data(changeset):
    """Convert changeset dictionary into an array with required features.

    Parameters
    ----------
    changeset: dict

    Returns
    -------
    data: tuple
        Tuple of data items
    """
    return [
        changeset['create'],
        changeset['modify'],
        changeset['delete']
    ]

def load_model():
    directory = os.path.dirname(os.path.realpath(__file__))
    filename = 'models/gabbar.pkl'
    model = os.path.join(directory, filename)
    return joblib.load(model)

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
