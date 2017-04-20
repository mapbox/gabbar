====
Data
====


.. code-block:: bash

    # Download real changesets for changesets in the dump from osmcha.
    python data/real_changesets.py downloads/v1/labelled_changesets.csv

    # Extract features for changesets.
    node data/extract_features.js \
        --changesets downloads/v1/labelled_changesets.csv \
        --realChangesets downloads/v1/labelled_real_changesets.json > downloads/v1/labelled_features.csv
