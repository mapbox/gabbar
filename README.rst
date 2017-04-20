======
gabbar
======

.. image:: https://img.shields.io/pypi/v/gabbar.svg

**EXPERIMENTAL: UNDER DEVELOPMENT**

Guarding OSM from invalid or suspicious edits, Gabbar is an alpha package of a pre-trained binary problematic/not problematic classifier that was trained on manually labelled changesets from OpenStreetMap.

.. image:: https://cloud.githubusercontent.com/assets/2899501/22643796/0a4a7878-ec86-11e6-9a97-fc63db1caab7.jpg
   :target: https://en.wikipedia.org/wiki/Gabbar_Singh_(character)

https://en.wikipedia.org/wiki/Gabbar_Singh_(character)

Install
=======

.. code-block:: bash

    pip install gabbar


Setup
=====

.. code-block:: bash

    # Setup a virtual environment with Python 3.
    mkvirtualenv --python=$(which python3) gabbar_py3

    # Install in locally editable (``-e``) mode.
    pip install -e .[test]

    # Install node dependencies.
    npm install

Get a prediction
================

.. code-block:: bash

    # Get a prediction for a changeset.
    python gabbar/scripts/cli.py --changeset 47734592


Run tests
=========

.. code-block:: bash

    # Run tests.
    npm run test


Hyperlinks
==========

- `Validating and protecting OpenStreetMap <https://www.mapbox.com/blog/validating-osm/>`_
- `Preparing accurate history and caching changesets <https://www.openstreetmap.org/user/geohacker/diary/40846>`_
- `An open database of inconsistent edits observed on OSM from OSMCha <http://www.openstreetmap.org/user/manoharuss/diary/40118>`_
