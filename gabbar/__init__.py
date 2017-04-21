import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import os
import json
import subprocess

from sklearn import svm
from sklearn.externals import joblib

def get_features(changeset_id):
    # Run node.js script to download real changeset and extract features.
    directory = os.path.dirname(os.path.realpath(__file__))
    helper = os.path.join(directory, 'helpers/real_changesets.js')

    # Arguments must contain only strings.
    features = json.loads(subprocess.check_output([helper, '--changesetID', str(changeset_id)]))
    return features

def filter_features(features):
    filtered = []
    indexes_to_ignore = [0, 4, 5, 6, 10]
    for i in range(len(features)):
        if i in indexes_to_ignore:
            continue
        else:
            filtered.append(features[i])
    return filtered

def normalize_features(features):
    directory = os.path.dirname(os.path.realpath(__file__))
    scaler_path = os.path.join(directory, 'trained/scaler.pkl')
    scaler = joblib.load(scaler_path)
    # Return just the item and not the list.
    return scaler.transform([features])[0]

def get_prediction(normalized_features):
    directory = os.path.dirname(os.path.realpath(__file__))
    model_path = os.path.join(directory, 'trained/model.pkl')
    model = joblib.load(model_path)
    prediction = model.predict([normalized_features])[0]

    # Return -1 if changeset is harmful and 1 if changeset is not.
    if prediction == True: return -1;
    else: return 1
