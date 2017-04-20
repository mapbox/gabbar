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

Unlabelled
----------
- OSMCHA: `unlabelled_changesets.csv.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_changesets.csv.tar.gz>`_ (1.6 MB)
- Real changesets: `unlabelled_real_changesets.json.tar.gz <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_real_changesets.json.tar.gz>`_ (319.5 MB)
- Features: `unlabelled_features.csv <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/unlabelled_features.csv>`_ (403.2 KB)


Create datasets
===============

.. code-block:: bash

    # Download all changesets labelled on osmcha.
    wget 'http://osmcha.mapbox.com/?is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&sort=-date&render_csv=True' -O labelled_changesets.csv

    # Download real changesets for labelled changesets from S3.
    python datasets/real_changesets.py labelled_changesets.csv > labelled_real_changesets.csv

    # Download all changesets on April Fool's day.
    wget 'http://osmcha.mapbox.com/?date__gte=2017-04-01&date__lte=2017-04-02&is_suspect=False&is_whitelisted=All&checked=All&all_reason=True&render_csv=True' -O april_fools_changesets.csv

    # Download real changesets for all changesets on April Fool's day.
    python datasets/real_changesets.py april_fools_changesets.csv > april_fools_real_changesets.csv



Create setup
============

.. code-block:: bash

    # Download and install Anaconda for Ubuntu x64.
    cd ~
    mkdir -p softwares && cd softwares
    wget https://repo.continuum.io/archive/Anaconda3-4.3.1-Linux-x86_64.sh
    bash Anaconda3-4.3.1-Linux-x86_64.sh
