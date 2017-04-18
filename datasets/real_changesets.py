import os
import json
import csv

import pandas as pd
import requests
import click

@click.command()
@click.option('--filename', help='CSV file with dump of changesets from osmcha.')
def main(filename):
    # URL of real changesets on S3.
    url = 'https://s3.amazonaws.com/mapbox/real-changesets/production/{}.json'

    changesets = pd.read_csv(filename)
    changeset_ids = changesets.drop_duplicates('ID')['ID'].values
    for changeset_id in changeset_ids:
        response = requests.get(url.format(changeset_id))
        try:
            if response.status_code == 200 and json.loads(response.text):
                print(response.text)
        except Exception:
            continue

        # This will take too long. Use prepared dataset file on S3 instead.
        # s3://mapbox/gabbar/v1/reviewed_real_changesets.json
        # break

if __name__ == '__main__':
    main()
