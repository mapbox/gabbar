import warnings
warnings.filterwarnings("ignore", category=UserWarning)

import argparse

import gabbar


def get_prediction(changeset):
    features = gabbar.get_features(changeset)
    filtered = gabbar.filter_features(features)
    normalized = gabbar.normalize_features(filtered)
    prediction = gabbar.get_prediction(normalized)
    return prediction

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Use pre-trained ML model to predict if changeset is harmful or not.')
    parser.add_argument('--changeset')
    args = parser.parse_args()
    changeset = args.changeset

    prediction = get_prediction(changeset)

    message = 'Cannot make a prediction. Sorry.'
    url = 'http://www.openstreetmap.org/changeset/{}'.format(changeset)
    if (prediction == 1):
        message = 'Changeset {} looks GOOD.'.format(url)
    elif (prediction == -1):
        message = 'Changeset {} looks HARMFUL.'.format(url)
    print('\n{}\n'.format(message))
