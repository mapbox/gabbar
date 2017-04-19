==================
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
