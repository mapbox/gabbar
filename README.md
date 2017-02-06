# gabbar


Guarding OSM from invalid or suspicious edits!


![amjad-khan](https://cloud.githubusercontent.com/assets/2899501/22643796/0a4a7878-ec86-11e6-9a97-fc63db1caab7.jpg)

https://en.wikipedia.org/wiki/Gabbar_Singh_(character)


### Running tests

```sh
# Setup a virtual environment.
$ mkvirtualenv gabbar

# Install in locally editable (``-e``) mode.
$ pip install -e .[test]

# Run the tests.
$ py.test
```


### Model training

```sh
# Download osm changeset dataset and split into good and problematic changeset files.
$ python training/dataprep.py

# View features of changeset used for training the model
$ head -n5 training/problematic.prep.csv
check date,create,modify,delete
2016-12-20T19:55:46.153444+00:00,0.0,0.0,327.0
2016-12-20T20:43:03.137419+00:00,9062.0,0.0,0.0
2016-12-20T12:09:43.259591+00:00,10.0,20.0,8.0
2016-12-21T10:09:33.445841+00:00,337.0,538.0,113.0

# Run datatrain.py to train a OneClassSVM on the dataset
$ python training/datatrain.py
precision = 0.942032
recall = 0.565568
f1_score = 0.706797

# Find the trained model as a .pkl file
$ ls training/gabbar.pkl
training/gabbar.pkl
```


### Hyperlinks
- [Validating and protecting OpenStreetMap](https://www.mapbox.com/blog/validating-osm/)
- [An open database of inconsistent edits observed on OSM from OSMCha](http://www.openstreetmap.org/user/manoharuss/diary/40118)
