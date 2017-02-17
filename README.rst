======
gabbar
======

**EXPERIMENTAL: UNDER DEVELOPMENT**

Guarding OSM from invalid or suspicious edits, Gabbar is an alpha package of a pre-trained binary problematic/not problematic classifier that was trained on manually labelled changesets from OpenStreetMap.


.. image:: https://cloud.githubusercontent.com/assets/2899501/22643796/0a4a7878-ec86-11e6-9a97-fc63db1caab7.jpg
   :target: https://en.wikipedia.org/wiki/Gabbar_Singh_(character)

https://en.wikipedia.org/wiki/Gabbar_Singh_(character)

Install
=======

.. code-block:: bash

    pip install gabbar


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

    # Download changesets checked on osmcha.
    wget -O training/changesets.csv https://www.dropbox.com/s/o05zxyhgkt8j4mx/changesets-checked-2017-02-17.csv?dl=1

    # Train a machine learning model.
    $ python training/train-model.py

                    precision   recall  f1-score    support

    problematic     0.91        0.02    0.04        1406
    not problematic 0.88        1.00    0.94        10249

    avg / total     0.88        0.88    0.83        11655


    # Find the trained model as a .pkl file.
    $ ls training/gabbar.pkl
    training/gabbar.pkl

    # Test model for a problematic edit prediction.
    $ python training/test-model.py


Hyperlinks
==========

- `Validating and protecting OpenStreetMap <https://www.mapbox.com/blog/validating-osm/>`_
- `An open database of inconsistent edits observed on OSM from OSMCha <http://www.openstreetmap.org/user/manoharuss/diary/40118>`_
