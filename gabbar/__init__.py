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
    keys = [
        'features_created',
        'features_modified',
        'features_deleted',
        'user_changesets',
        'user_features',
        'bbox_area',
        'node_count',
        'way_count',
        'relation_count',
        'property_modifications',
        'geometry_modifications',
        'feature_version_new',
        'feature_version_low',
        'feature_version_medium',
        'feature_version_high',
        'changeset_editor_iD',
        'changeset_editor_JOSM',
        'changeset_editor_MAPS.ME',
        'changeset_editor_Potlatch',
        'changeset_editor_Redaction bot',
        'changeset_editor_Vespucci',
        'changeset_editor_OsmAnd',
        'changeset_editor_Merkaartor',
        'changeset_editor_gnome',
        'changeset_editor_other',
        'aerialway',
        'aeroway',
        'amenity',
        'barrier',
        'boundary',
        'building',
        'craft',
        'emergency',
        'geological',
        'highway',
        'historic',
        'landuse',
        'leisure',
        'man_made',
        'military',
        'natural',
        'office',
        'place',
        'power',
        'public_transport',
        'railway',
        'route',
        'shop',
        'sport',
        'tourism',
        'waterway',
    ]
    filtered = []
    for key in keys:
        filtered.append(features[key])
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
