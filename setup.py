from codecs import open as codecs_open
from setuptools import setup, find_packages


# Get the long description from the relevant file
with codecs_open('README.md', encoding='utf-8') as f:
    long_description = f.read()


setup(name='autovandal',
      version='0.0.1',
      description=u"Robots will catch vandalism on OpenStreetMap!",
      long_description=long_description,
      classifiers=[],
      keywords='',
      author=u"Mapbox Team",
      author_email='team@mapbox.com',
      url='https://github.com/mapbox/autovandal',
      license='MIT',
      packages=find_packages(exclude=['ez_setup', 'examples', 'tests']),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'click',
          'numpy',
          'scipy',
          'scikit-learn'
      ],
      extras_require={
          'test': ['pytest'],
      },
      entry_points="""
      [console_scripts]
      autovandal=autovandal.scripts.cli:cli
      """
      )
