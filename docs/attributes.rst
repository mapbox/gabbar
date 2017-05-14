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

    aws s3 sync s3://mapbox-gabbar/public/datasets/training/ training/
    cd training
    tar -xzf real-changesets.tar.gz
    tar -xzf user-details.tar.gz

    cd ~
    head -n10 training/changesets.csv > training/sample-changesets.csv

    vim extract-attributes.js

    npm install minimist csv d3-queue @turf/turf real-changesets-parser underscore

    node extract-attributes.js \
        --changesets training/changesets.csv \
        --realChangesets training/real-changesets/ \
        --userDetails training/user-details/ > training/features.csv

    aws s3 cp training/features.csv s3://mapbox-gabbar/public/datasets/training/features.csv
