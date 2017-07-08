# gabbar


![](https://img.shields.io/pypi/v/gabbar.svg)
![](https://img.shields.io/circleci/project/github/mapbox/gabbar.svg)


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

<img width="919" alt="screen shot 2017-06-30 at 4 17 46 pm" src="https://user-images.githubusercontent.com/2899501/27732638-ce026614-5daf-11e7-900b-caff399a9da9.png">


```bash
# A prediction of "-1" represents that this feature is an anomaly (outlier).
gabbar 49172351
[
    {
        "attributes": {
            "action_create": 0,
            "action_delete": 0,
            "action_modify": 1,
            "area_of_feature_bbox": 109591.9146,
            "feature_name_touched": 0,
            "feature_version": 17,
            "highway_tag_created": 41,
            "highway_tag_deleted": 0,
            "highway_value_difference": 0,
            "length_of_longest_segment": 0.1577,
            "primary_tags_difference": 1
        },
        "changeset_id": "49172351",
        "feature_id": "124863896",
        "feature_type": "way",
        "prediction": -1,
        "timestamp": "2017-07-08 22:40:19.342254",
        "version": "0.6"
    }
]
```

## Testing

```bash
npm test
```

## Hyperlinks

- [Validating and protecting OpenStreetMap](https://www.mapbox.com/blog/validating-osm/)
- [Preparing accurate history and caching changesets](https://www.openstreetmap.org/user/geohacker/diary/40846)
- [An open database of inconsistent edits observed on OSM from OSMCha](http://www.openstreetmap.org/user/manoharuss/diary/40118)
