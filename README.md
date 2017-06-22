# gabbar

![](https://img.shields.io/pypi/v/gabbar.svg)

**EXPERIMENTAL: UNDER DEVELOPMENT**

Guarding OpenStreetMap from invalid or suspicious edits, Gabbar is an alpha package of a pre-trained binary problematic/not problematic classifier that was trained on manually labelled changesets from OpenStreetMap.

![](https://cloud.githubusercontent.com/assets/2899501/22643796/0a4a7878-ec86-11e6-9a97-fc63db1caab7.jpg)

https://en.wikipedia.org/wiki/Gabbar_Singh_(character)


## Installation

```bash
pip install gabbar
```


## Setup

```bash
# Setup a virtual environment with Python 3.
mkvirtualenv --python=$(which python3) gabbar_py3

# Install in locally editable (``-e``) mode.
pip install -e .[test]

# Install node dependencies.
npm install
```

## Prediction

```bash
# Get a prediction for a changeset.
$ gabbar 47734592
{"prediction": "good", "timestamp": "2017-04-26 01:05:00.441977", "version": "0.2.4"}
```

## Testing

```bash
npm run test
```

## Hyperlinks

- [Validating and protecting OpenStreetMap](https://www.mapbox.com/blog/validating-osm/)
- [Preparing accurate history and caching changesets](https://www.openstreetmap.org/user/geohacker/diary/40846)
- [An open database of inconsistent edits observed on OSM from OSMCha](http://www.openstreetmap.org/user/manoharuss/diary/40118)
