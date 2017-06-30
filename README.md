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
# Get a prediction for a changeset.
gabbar 47734592
[
    {
        "attributes": {
            "action_create": 0,
            "action_delete": 0,
            "action_modify": 1,
            "feature_version": 15,
            "geometry_kinks": 0,
            "geometry_line_distance": 0.619,
            "geometry_type_node": 0,
            "geometry_type_relation": 0,
            "geometry_type_way": 1,
            "new_barrier=yes": 0,
            "new_bicycle=no": 0,
            "new_bicycle=yes": 0,
            "new_bridge=yes": 0,
            "new_construction=motorway": 0,
            "new_foot=yes": 0,
            "new_footway=sidewalk": 0,
            "new_highway=coastline": 0,
            "new_highway=footway": 0,
            "new_highway=living_street": 0,
            "new_highway=motorway": 0,
            "new_highway=path": 0,
            "new_highway=primary": 1,
            "new_highway=road": 0,
            "new_highway=secondary": 0,
            "new_highway=service": 0,
            "new_highway=tertiary": 0,
            "new_highway=track": 0,
            "new_highway=unclassified": 0,
            "new_horse=no": 0,
            "new_horse=yes": 0,
            "new_landuse=cemetery": 0,
            "new_landuse=footway": 0,
            "new_landuse=forest": 0,
            "new_landuse=grass": 0,
            "new_landuse=recreation_ground": 0,
            "new_landuse_1=park": 0,
            "new_landuse_1=recreation_ground": 0,
            "new_landuse_2=festival area": 0,
            "new_landuse_3=dog park": 0,
            "new_landuse_3=recreation": 0,
            "new_landuse_4=recreation_ground": 0,
            "new_landuse_5=water_park": 0,
            "new_lanes=2": 0,
            "new_layer=1": 0,
            "new_leisure=park": 0,
            "new_lit=yes": 0,
            "new_maxspeed=50": 0,
            "new_maxspeed=8": 0,
            "new_natural=footway": 0,
            "new_natural=tree_row": 0,
            "new_noname=yes": 0,
            "new_oneway=no": 0,
            "new_park=yes": 0,
            "new_surface=asphalt": 0,
            "new_surface=dirt": 0,
            "new_surface=gravel": 0,
            "new_surface=unpaved": 0,
            "new_surface_1=asphalt": 0,
            "new_surface_1=ground": 0,
            "new_surface_2=unpaved": 0,
            "new_surface_2=wood": 0,
            "new_tracktype=grade3": 0,
            "new_user_mapping_days": 0,
            "new_waterway=river": 0,
            "new_waterway=stream": 0,
            "old_construction=path": 0,
            "old_embankment=yes": 0,
            "old_highway=construction": 0,
            "old_highway=footway": 0,
            "old_highway=path": 0,
            "old_highway=pedestrian": 0,
            "old_highway=primary": 0,
            "old_highway=residential": 0,
            "old_highway=service": 0,
            "old_highway=tertiary": 0,
            "old_highway=unclassified": 0,
            "old_lit=no": 0,
            "old_maxspeed=30": 0,
            "old_natural=coastline": 0,
            "old_oneway=yes": 0,
            "old_park=paseo": 0,
            "old_user_mapping_days": 0,
            "old_width=0": 0
        },
        "changeset_id": "49626684",
        "feature_id": "17166500",
        "feature_type": "way",
        "prediction": 0,
        "timestamp": "2017-06-30 16:18:07.965246",
        "version": 0.5
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
