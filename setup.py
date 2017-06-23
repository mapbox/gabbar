import os

from codecs import open as codecs_open
from setuptools import setup, find_packages


# Get the long description from the relevant file
with codecs_open('README.md', encoding='utf-8') as f:
    long_description = f.read()

directory = os.path.dirname(os.path.realpath(__file__))
version_filepath = os.path.join(directory, 'VERSION')
with open(version_filepath) as f:
    version = f.read().strip()

setup(name='gabbar',
      version=version,
      description=u"Guarding OpenStreetMap from invalid or suspicious edits!",
      long_description=long_description,
      classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3.6'
      ],
      keywords='osm',
      author=u"Mapbox",
      author_email='team@mapbox.com',
      url='https://github.com/mapbox/gabbar',
      license='MIT',
      packages=find_packages(exclude=['ez_setup', 'data', 'docs', 'notebooks', 'scripts', 'tests']),
      package_data={'gabbar': ['trained/scaler.pkl', 'trained/model.pkl', 'helpers/real_changesets.js']},
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'click',
          'numpy',
          'scipy',
          'scikit-learn[alldeps]'
      ],
      extras_require={
          'test': ['pytest', 'pandas', 'requests', 'twine'],
      },
      entry_points="""
      [console_scripts]
      gabbar=gabbar.scripts.cli:cli
      """
      )
