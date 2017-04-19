# gabbar

import os
import requests
import json

from sklearn import svm
from sklearn.externals import joblib

has_legs = False

def download_changeset(changeset_id):
    url = 'https://s3.amazonaws.com/mapbox/real-changesets/production/{}.json'
    try:
        response = requests.get(url.format(changeset_id))
        if response.status_code == 200:
            changeset = json.loads(response.text)
            return changeset
    except Exception:
        return None


def extract_features(changeset):

    def get_changeset_id(changeset):
        return changeset['metadata']['id']

    def get_created_features(changeset):
        created_features = []
        for feature in changeset['elements']:
            if feature['action'] == 'create':
                created_features.append(feature)
        return created_features

    def get_modified_features(changeset):
        modified_features = []
        for feature in changeset['elements']:
            if feature['action'] == 'modify':
                modified_features.append(feature)
        return modified_features

    def get_deleted_features(changeset):
        deleted_features = []
        for feature in changeset['elements']:
            if feature['action'] == 'delete':
                deleted_features.append(feature)
        return deleted_features

    features = {
        'changeset_id': get_changeset_id(changeset),
        'features_created': len(get_created_features(changeset)),
        'features_modified': len(get_modified_features(changeset)),
        'features_deleted': len(get_deleted_features(changeset))
    }
    return features


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
