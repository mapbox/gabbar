==========
Attributes
==========

**Changeset attributes**

- changeset_editor
- bbox_area: Area of changeset bbox
- features_touched: All features
- features_created: Number of features created in the changeset
- features_modified: Number of features modified in the changeset
- features_deleted: Number of features deleted in the changeset


**Feature attributes**

- features_node
- features_way
- features_relation
- features_modified_property
- features_modified_geometry

**User attributes**

- user_changesets
- user_features
- user_mapping_days
- user_discussions
- user_changesets_with_discussions


Extract attributes
==================

.. code-block:: bash

    # Download all datasets required to extract features.
    aws s3 sync s3://mapbox-gabbar/public/datasets/validation/ .

    # Extract folders when required.
    tar -xzf real-changesets.tar.gz
    tar -xzf user-details.tar.gz

    # Create a small sample to test if the script works.
    head -n10 training/changesets.csv > training/sample-changesets.csv

    # Prepare the script.
    vim extract-attributes.js

    # Install required packages for the extract features script.
    npm install minimist csv d3-queue @turf/turf real-changesets-parser underscore

    # Extract features passing all the datasets.
    node extract-attributes.js \
        --changesets changesets.csv \
        --realChangesets real-changesets/ \
        --userDetails user-details/ > attributes.csv

    # Remove any duplicate rows if any.
    uniq -c attributes.csv > attributes-unique.csv
    mv attributes-unique.csv attributes.csv

    # Copy features to s3.
    aws s3 cp attributes.csv s3://mapbox-gabbar/public/datasets/validation/attributes.csv
