======
gabbar
======

**EXPERIMENTAL: UNDER DEVELOPMENT**

Guarding OSM from invalid or suspicious edits, Gabbar is an alpha package of a pre-trained binary problematic/not problematic classifier that was trained on manually labelled changesets from OpenStreetMap.


.. image:: https://cloud.githubusercontent.com/assets/2899501/22643796/0a4a7878-ec86-11e6-9a97-fc63db1caab7.jpg
   :target: https://en.wikipedia.org/wiki/Gabbar_Singh_(character)

https://en.wikipedia.org/wiki/Gabbar_Singh_(character)


Running tests
=============

.. code-block:: bash

    # Setup a virtual environment.
    $ mkvirtualenv gabbar

    # Install in locally editable (``-e``) mode.
    $ pip install -e .

    # Run the tests.
    $ py.test


Publishing to PyPi
==================

.. code-block:: bash

    # Bump the version.
    $ $EDITOR setup.py

    # Bump the tag.
    $ git tag <VERSION>

    # Push your changes to Github.
    $ git push
    $ git push --tags

    # Create a Source Distribution.
    python setup.py sdist

    # A wheel can be installed without needing to go through the "build" process.
    python setup.py bdist_wheel --universal

    # Optionally upload to Test PyPI if required.
    $ twine upload dist/* -r testpypi

    # Upload to PyPi
    twine upload dist/*


Model training
==============

.. code-block:: bash

    # Download osm changeset dataset and split into good and problematic changeset files.
    $ python training/dataprep.py

    # View features of changeset used for training the model.
    $ head -n5 training/problematic.prep.csv
    check date,create,modify,delete
    2016-12-20T19:55:46.153444+00:00,0.0,0.0,327.0
    2016-12-20T20:43:03.137419+00:00,9062.0,0.0,0.0
    2016-12-20T12:09:43.259591+00:00,10.0,20.0,8.0
    2016-12-21T10:09:33.445841+00:00,337.0,538.0,113.0

    # Run datatrain.py to train a OneClassSVM on the dataset.
    $ python training/datatrain.py
    training samples: 12364
    [testing] good samples: 5299
    [testing] problematic samples: 671
    precision = 0.915625
    recall = 0.442348
    f1_score = 0.596514

    # Find the trained model as a .pkl file.
    $ ls training/gabbar.pkl
    training/gabbar.pkl


Hyperlinks
==========

- `Validating and protecting OpenStreetMap <https://www.mapbox.com/blog/validating-osm/>`_
- `An open database of inconsistent edits observed on OSM from OSMCha <http://www.openstreetmap.org/user/manoharuss/diary/40118>`_
