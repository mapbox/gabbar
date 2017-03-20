from codecs import open as codecs_open
from setuptools import setup, find_packages


# Get the long description from the relevant file
with codecs_open('README.rst', encoding='utf-8') as f:
    long_description = f.read()


setup(name='gabbar',
      version='0.2.4',
      description=u"Guarding OSM from invalid or suspicious edits!",
      long_description=long_description,
      classifiers=[
        'Development Status :: 3 - Alpha',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 2.7'
      ],
      keywords='osm',
      author=u"Mapbox",
      author_email='team@mapbox.com',
      url='https://github.com/mapbox/gabbar',
      license='MIT',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests', 'training']),
      package_data={'gabbar': ['models/gabbar.pkl']},
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'click',
          'numpy',
          'scipy',
          'scikit-learn'
      ],
      extras_require={
          'test': ['pytest', 'pandas'],
      },
      entry_points="""
      [console_scripts]
      gabbar=gabbar.scripts.cli:cli
      """
      )
