# Anomaly detection


Todo
- Prepare dataset for training, validation and testing
    - Iteration 1
        - Training: 8,000 good highways
        - Validation: 2,000 good highways and 55 harmful highways
        - Testing: 2,000 unlabelled random highways from testing dump
- What features to use for anomaly detection
    - Latest features of highway classifier without tags
    - Add vectorized tags
- What model can we use to prototype
    - `sklearn.ensemble.IsolationForest`
- Visualize features to check for Gaussian distribution
    - hist()
- Transform features to get a Gaussian distribution
    - Log transformation
    - Square root (power of one half)
    - Power of one third
    - x ^ 0.05
- Metrics to measure performance of Anomaly detection model
- Error analysis to view changesets predicted correctly and incorrectly
- Modify epsilon to view its effect on model performance


Bring a new stack up for anomaly detection

## Don't miss
- 44929925
- 47977746 `service` -> `footway`


## Attributes

### Properties
- Deletion of highway tags is a priority. Ex: `highway=pedestrian`. How to give a large value to this
- Difference between hierarchical value of highway in new and old version.
    - `highway=tertiary` -> `highway=footway`
    - `residential` -> `footway`
    - 48595090
- Adding other primary tags. Ex: `waterway=stream` or `landuse=stream`
    - 47962379
- Moving `unclassified` down in the list to make the difference bigger from `residential` -> `unclassified`
    - Side effect of: 46692872
- Remove feature type (node|way|relation)
    - Node features are under-represented for highway's


### Geometry
- Area of the bbox around the highway
    - The larger the area, the longer or more important visually
    - Ex: 48667383
- Length of longest segment for dragged features



- `highway_tag_created` similar to `highway_tag_deleted`

- Ratio of modifiecation wrt version of feature
    - Currently high version features are flagged as outliers
    - Ex: 47432187

- Removing one primary tag and adding another primary tag is cancelling out each other
    - Ex: non_highway_primary_tags
- Number of kinks in highway geometry

- Number of tags in the feature is zero
    - 46598145
    - 46407315

- Tags touched: How many tags are created, modified or deleted between the new and old version

- Area of highway
    - If has area, that means it is a polygon


- Percentage of feature modified * version of feature
    - Higher the version of feature, larger modifications are anomalous






- Total tags created
- Total tags modified
- Total tags deleted

- Percentage of tags created
- Percentage of tags modified
- Percentage of tags deleted

- Percentage of values created
- Percentage of values modified
- Percentage of values deleted

- Ratio of user experience between old version and new version

- Ratio of lineLength to number of nodes

- User same as old version

- Number of days since previous edit to feature

- Changeset editor

- Ratio of scores for highway between new and old version from TagInfo

- Primary tags OneHotEncoded



- TagInfo for values of highway combination tags that are
- Difference between number of features in OpenStreetMap of previous value to new value

## Notes
- Importantly, we are not giving the entire dataset, just a sample so some might look like anomalies

Prepare dataset for training, validation and testing
- We use the good highways to train the anomaly detection model
- This means, we can use highway features from changesets where more than one feature was touched because


#### 0. Setup

```bash
# Create required directories, both for data and code.
mkdir -p downloads/anomaly-detection/
mkdir -p data/ && mkdir -p data/feature-classifier/

# Install required packages.
npm install minimist csv d3-queue request mkdirp real-changesets-parser @turf/turf underscore  moment @mapbox/osm-compare simple-statistics naughty-words
```


#### Download changesets from osmcha

```bash
vim data/feature-classifier/download-osmcha.js
node data/feature-classifier/download-osmcha.js >> downloads/anomaly-detection/changesets.csv

# Total changesets: 60531
wc -l downloads/anomaly-detection/changesets.csv
```


#### Download real changesets

```bash
vim data/feature-classifier/download-real-changesets.js

node data/feature-classifier/download-real-changesets.js \
    --changesets downloads/anomaly-detection/changesets.csv \
    --directory downloads/anomaly-detection/

# Total real changesets: 46036
ls -l downloads/anomaly-detection/real-changesets/ | wc -l
```


#### Download user details

```bash
vim data/feature-classifier/download-user-details.js

node --max-old-space-size=6000 data/feature-classifier/download-user-details.js \
    --changesets downloads/anomaly-detection/changesets.csv \
    --realChangesetsDirectory downloads/anomaly-detection/real-changesets/ \
    --directory downloads/anomaly-detection/

# Total user details: 33879
ls -l downloads/anomaly-detection/user-details/ | wc -l
```


#### Compress and upload to s3

```bash
tar -czf anomaly-detection-2017-07-05.tar.gz -C downloads/ anomaly-detection/
aws s3 cp anomaly-detection-2017-07-05.tar.gz s3://mapbox-gabbar/dumps/ --region 'us-west-2'


# To download it back.
aws s3 cp s3://mapbox-gabbar/dumps/anomaly-detection-2017-07-05.tar.gz . --region 'us-west-2'
```



#### Extract attributes

```sh
# Labelled samples.
head -n1000 downloads/anomaly-detection/labelled/changesets.csv > downloads/anomaly-detection/labelled/sample-changesets.csv

mkdir -p datasets
vim datasets/anomaly-detection.js

node datasets/anomaly-detection.js \
    --changesets downloads/anomaly-detection/labelled/changesets.csv \
    --realChangesetsDir downloads/anomaly-detection/labelled/real-changesets/ \
    --userDetailsDir downloads/anomaly-detection/labelled/user-details/ > downloads/anomaly-detection/labelled/attributes.csv

# Number of rows: 2274
wc -l downloads/anomaly-detection/labelled/attributes.csv


# Unlabelled samples.
head -n5000 downloads/anomaly-detection/unlabelled/changesets.csv > downloads/anomaly-detection/unlabelled/sample-changesets.csv

node datasets/anomaly-detection.js \
    --changesets downloads/anomaly-detection/unlabelled/sample-changesets.csv \
    --realChangesetsDir downloads/anomaly-detection/unlabelled/real-changesets/ \
    --userDetailsDir downloads/anomaly-detection/unlabelled/user-details/ > downloads/anomaly-detection/unlabelled/attributes.csv

# Number of rows: 2274
wc -l downloads/anomaly-detection/unlabelled/attributes.csv
```


### Analyze attributes

```bash
node datasets/analyze-predictions.js --predictionsDir downloads/predictions/anomaly-detection
```


### Extract feature

```bash

node datasets/extract-feature.js \
    --realChangesetsDir downloads/anomaly-detection/large/labelled/real-changesets/ \
    --changesetID 46637047 \
    --featureType "node" \
    --featureID 4635066575 > downloads/feature.json

```

## Error analysis

```bash

# Start with just feature version.

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	184 	1634

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	6 	49
Labelled good 	60 	339


# Deletion of highway tag from feature.

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	184 	1634

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	14 	41
Labelled good 	57 	342


# Difference in highway value classification

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	182 	1636

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	27 	28
Labelled good 	46 	353


# Number of primary tags

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	183 	1635

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	28 	27
Labelled good 	46 	353


# Primary tags difference between new and old version

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	183 	1635

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	31 	24
Labelled good 	47 	352

# Moving unclassified down the list.

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	182 	1636

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	37 	18
Labelled good 	46 	353

# Removing geometry type (node | way | relation)

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	189 	1629

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	40 	15
Labelled good 	44 	355


# Adding area of feature bbox

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	182 	1636

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	40 	15
Labelled good 	41 	358


# Adding length of the longest segment in the highway

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	182 	1636

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	40 	15
Labelled good 	44 	355


# Adding is highway tag created

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	182 	1636

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	40 	15
Labelled good 	41 	358


# 1,000 labelled samples

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	70 	628

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	26 	101
Labelled good 	17 	158

# 10,000 labelled samples

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	696 	6263

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	210 	1091
Labelled good 	205 	1535

# 100,000 labelled samples

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	6950 	62549

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	1929 	11197
Labelled good 	1789 	15586

# Entire dataset 321,657

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	22334 	200971

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	6201 	36325
Labelled good 	5632 	50194


# GridSearch with 1000 samples

- Training
Predicted harmful 	Predicted good
Labelled harmful 	0 	0
Labelled good 	7 	691

- Validation
Predicted harmful 	Predicted good
Labelled harmful 	2 	125
Labelled good 	4 	171


```
