========
Datasets
========


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


Create setup
============

.. code-block:: bash

    # Download and install Anaconda for Ubuntu x64.
    cd ~
    mkdir -p softwares && cd softwares
    wget https://repo.continuum.io/archive/Anaconda3-4.3.1-Linux-x86_64.sh
    bash Anaconda3-4.3.1-Linux-x86_64.sh
