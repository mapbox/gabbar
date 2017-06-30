import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import sys
import os
import datetime
import json
import subprocess

import click

import gabbar

from sklearn.externals import joblib

def get_prediction(changeset):
    features = gabbar.get_features(changeset)
    filtered = gabbar.filter_features(features)
    normalized = gabbar.normalize_features(filtered)
    prediction = gabbar.get_prediction(normalized)
    return {
        'features': features,
        'prediction': prediction
    };


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


def getFeatureType(types):
    if types[0] == 1:
        return 'node'
    elif types[1] == 1:
        return 'way'
    elif types[2] == 1:
        return 'relation'

def process_changeset(changeset_id):
    # Run node.js script to download real changeset and extract features.
    directory = os.path.dirname(os.path.realpath(__file__))
    # Getting the parent directory.
    directory = os.path.abspath(os.path.join(directory, os.pardir))
    helper = os.path.join(directory, 'helpers/real_changeset.js')

    # Arguments must contain only strings.
    data = json.loads(subprocess.check_output([helper, '--changesetID', str(changeset_id)]))

    results = []
    # If there are no attributes, that means there were no interesting samples to process in this changeset.
    if (not data) or (len(data['attributes']) == 0): return results;

    directory = os.path.dirname(os.path.realpath(__file__))

    # Load all pre-trained assets.
    model = joblib.load(os.path.join(directory, '../trained/model.pkl'))
    new_vectorizer = joblib.load(os.path.join(directory, '../trained/new_vectorizer.pkl'))
    old_vectorizer = joblib.load(os.path.join(directory, '../trained/old_vectorizer.pkl'))

    directory = os.path.dirname(os.path.realpath(__file__))
    version_filepath = os.path.join(directory, '../../VERSION')
    with open(version_filepath) as f:
        version = f.read().strip()


    for i in range(len(data['attributes'])):
        attributes = data['attributes'][i]

        mapping = dict(zip(data['header'], attributes))

        # Leaving out non training parameters.
        model_attribute_keys = data['header'][3:-2] \
            + ['new_' + item for item in new_vectorizer.get_feature_names()] \
            + ['old_' + item for item in old_vectorizer.get_feature_names()]
        model_attribute_values = list(attributes[3:-2]) \
            + [int(item) for item in new_vectorizer.transform([mapping['new_tags']]).toarray()[0]] \
            + [int(item) for item in old_vectorizer.transform([mapping['old_tags']]).toarray()[0]]

        prediction = int(model.predict([model_attribute_values])[0])

        result = {
            'changeset_id': attributes[0],
            'feature_id': attributes[2],
            'feature_type': getFeatureType(attributes[7:10]),  # TODO
            'attributes': dict(zip(model_attribute_keys, model_attribute_values)),
            'prediction': prediction,
            'timestamp': datetime.datetime.now(),
            'version': version,
        }
        results.append(result)
    return results


@click.command('gabbar')
@click.argument('changeset', type=str, metavar='changeset')
def cli(changeset):

    results = process_changeset(changeset)
    print(json.dumps(results, sort_keys=True, default=converter, indent=4))

    # results = get_prediction(changeset);
    #
    # features = results['features'];
    # prediction = results['prediction']
    #
    # if prediction == 1:
    #     prediction = 'good'
    # else:
    #     prediction = 'harmful'
    #
    # directory = os.path.dirname(os.path.realpath(__file__))
    # version_filepath = os.path.join(directory, '../../VERSION')
    # with open(version_filepath) as f:
    #     version = f.read().strip()
    #
    # timestamp = datetime.datetime.now()
    # results = {
    #     'changeset': changeset,
    #     'prediction': prediction,
    #     'features': features,
    #     'version': version,
    #     'timestamp': timestamp
    # }
    # print(json.dumps(results, sort_keys=True, default=converter))
