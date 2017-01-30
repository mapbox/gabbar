# autovandal


from sklearn import svm
from sklearn.externals import joblib


has_legs = False


def changeset_to_data(changeset):
    """Convert changeset object into data array.

    Parameters
    ----------
    changeset: dict
        Numpy ndarray, for best results a 2D array
    Returns
    -------
    data: tuple
        Tuple of data items
    """
    features = ["editor", "source", "create", "modify", "delete"]
    return [changeset[feature] for feature in features]


def predict(data):
    clf = svm.OneClassSVM(nu=0.1, kernel="rbf", gamma=0.1)
    clf = joblib.load('models/autovandal.pkl')
    prediction = clf.predict(data)
    return prediction
