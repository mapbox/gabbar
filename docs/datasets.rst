========
Datasets
========


Setup
=====

.. code-block:: bash

    # Download and install Anaconda. Instructions for Ubuntu x64.
    cd ~
    mkdir -p softwares && cd softwares
    wget https://repo.continuum.io/archive/Anaconda3-4.3.1-Linux-x86_64.sh
    bash Anaconda3-4.3.1-Linux-x86_64.sh


Training
========

Labelled changesets on osmcha between January, 2017 and April, 2017

.. code-block:: bash

    # Inside the home directory.
    cd ~

    # Download changesets from osmcha
    wget 'http://osmcha.mapbox.com/?date__gte=2017-01-01&date__lte=2017-04-30&is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&render_csv=True' -O changesets.csv

    # Create a small sample file to test the script.
    head -n10 changesets.csv > sample-changesets.csv

    # Copy script to download datasets.
    vim download-datasets.js

    # Install required packages.
    npm install csv d3-queue request mkdirp minimist

    # Run script first on the sample and later on all changesets.
    node download-datasets.js \
        --changesets sample-changesets.csv \
        --directory .

    # Compress folders.
    tar -czf real-changesets.tar.gz real-changesets/
    tar -czf user-details.tar.gz user-details/

    # Move datasets onto s3.
    aws s3 cp changesets.csv s3://mapbox-gabbar/public/datasets/training/changesets.csv
    aws s3 cp real-changesets.tar.gz s3://mapbox-gabbar/public/datasets/training/real-changesets.tar.gz
    aws s3 cp user-details.tar.gz s3://mapbox-gabbar/public/datasets/training/user-details.tar.gz


Validation
==========

Labelled changesets on osmcha in May, 2017

.. code-block:: bash

    # Inside the home directory.
    cd ~

    # Download changesets from osmcha
    wget 'http://osmcha.mapbox.com/?date__gte=2017-05-01&date__lte=2017-05-31&is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&render_csv=True' -O changesets.csv

    # Create a small sample file to test the script.
    head -n10 changesets.csv > sample-changesets.csv

    # Copy script to download datasets.
    vim download-datasets.js

    # Install required packages.
    npm install csv d3-queue request mkdirp minimist

    # Run script first on the sample and later on all changesets.
    node download-datasets.js \
        --changesets changesets.csv \
        --directory .

    # Compress folders.
    tar -czf real-changesets.tar.gz real-changesets/
    tar -czf user-details.tar.gz user-details/

    # Move datasets onto s3.
    aws s3 cp changesets.csv s3://mapbox-gabbar/public/datasets/validation/changesets.csv
    aws s3 cp real-changesets.tar.gz s3://mapbox-gabbar/public/datasets/validation/real-changesets.tar.gz
    aws s3 cp user-details.tar.gz s3://mapbox-gabbar/public/datasets/validation/user-details.tar.gz


Download datasets
=================

Labelled
--------
- OSMCHA: `labelled_changesets.csv.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/labelled_changesets.csv.tar.gz>`_ (5.2 MB)
- Real changesets: `labelled_real_changesets.json.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/labelled_real_changesets.json.tar.gz>`_ (497.8 MB)
- Features: `labelled_features.csv <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/labelled_features.csv>`_ (471.3 KB)
- User details: `labelled_user_details.json <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/labelled_user_details.json>`_ (660.2 KB)

Unlabelled
----------
- OSMCHA: `unlabelled_changesets.csv.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_changesets.csv.tar.gz>`_ (1.6 MB)
- Real changesets: `unlabelled_real_changesets.json.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_real_changesets.json.tar.gz>`_ (319.5 MB)
- Features: `unlabelled_features.csv <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_features.csv>`_ (403.2 KB)
- User details: `unlabelled_user_details.json <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_user_details.json>`_ (369.2 KB)

Create datasets
===============

.. code-block:: bash

    # Download all changesets labelled on osmcha.
    wget 'http://osmcha.mapbox.com/?is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&sort=-date&render_csv=True' -O labelled_changesets.csv

    # Download real changesets for changesets in the dump from osmcha.
    python data/real_changesets.py downloads/v1/labelled_changesets.csv > downloads/v1/labelled_real_changesets.csv

    # Download all changesets on April Fool's day.
    wget 'http://osmcha.mapbox.com/?date__gte=2017-04-01&date__lte=2017-04-02&is_suspect=False&is_whitelisted=All&checked=All&all_reason=True&render_csv=True' -O april_fools_changesets.csv

    # Extract features for changesets.
    node data/extract_features.js \
        --realChangesets downloads/v1/labelled_real_changesets.json > downloads/v1/labelled_features.csv \
        --userDetails downloads/v1/labelled_user_details.json \
        --changesets downloads/v1/labelled_changesets.csv
