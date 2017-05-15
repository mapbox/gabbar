========
Datasets
========


Attributes
==========

- `Training attributes <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/datasets/training/attributes.csv>`_
- `Validation attributes <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/datasets/validation/attributes.csv>`_
- `Testing attributes <https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/datasets/testing/attributes.csv>`_


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


Testing
=======

Unlabelled changesets from osmcha on 1st May, 2017

.. code-block:: bash

    # Inside the home directory.
    cd ~

    # Download changesets from osmcha
    wget 'http://osmcha.mapbox.com/?date__gte=2017-05-01&date__lte=2017-05-02&is_suspect=False&is_whitelisted=All&harmful=None&checked=All&all_reason=True&render_csv=True' -O changesets.csv

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
    aws s3 cp changesets.csv s3://mapbox-gabbar/public/datasets/testing/changesets.csv
    aws s3 cp real-changesets.tar.gz s3://mapbox-gabbar/public/datasets/testing/real-changesets.tar.gz
    aws s3 cp user-details.tar.gz s3://mapbox-gabbar/public/datasets/testing/user-details.tar.gz
