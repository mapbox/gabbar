import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import sys
import os
import datetime
import json

import click

import gabbar

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


@click.command('gabbar')
@click.argument('changeset', type=str, metavar='changeset')
def cli(changeset):
    results = get_prediction(changeset);

    features = results['features'];
    prediction = results['prediction']

    if prediction == 1:
        prediction = 'good'
    else:
        prediction = 'harmful'

    directory = os.path.dirname(os.path.realpath(__file__))
    version_filepath = os.path.join(directory, '../../VERSION')
    with open(version_filepath) as f:
        version = f.read().strip()

    timestamp = datetime.datetime.now()
    results = {
        'changeset': changeset,
        'prediction': prediction,
        'features': features,
        'version': version,
        'timestamp': timestamp
    }
    print(json.dumps(results, sort_keys=True, default=converter))
