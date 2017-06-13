# Datasets for feature classifier

#### 1. Get changesets from osmcha.

```sh
mkdir -p downloads/ && mkdir -p downloads/feature-classifier/

# Download changesets from osmcha for training and validation.
# All single feature modification changesets reviewed on osmcha from 1st Jan, 2017 till 31st May, 2017.
wget 'https://osmcha.mapbox.com/?date__gte=2017-01-01&date__lte=2017-05-31&create__gte=0&create__lte=0&modify__gte=1&modify__lte=1&delete__gte=0&delete__lte=0&is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&render_csv=True' -O downloads/feature-classifier/labelled-changesets.csv

# Number of rows: 12061
wc -l downloads/feature-classifier/labelled-changesets.csv

# Download changesets from osmcha for testing.
# All single feature modification changesets not reviewed on osmcha from 1st May, 2017 till 7th May, 2017.
wget 'https://osmcha.mapbox.com/?date__gte=2017-05-01&date__lte=2017-05-07&create__gte=0&create__lte=0&modify__gte=1&modify__lte=1&delete__gte=0&delete__lte=0&is_suspect=False&is_whitelisted=All&harmful=None&checked=False&all_reason=True&render_csv=True' -O downloads/feature-classifier/unlabelled-changesets.csv

# Number of rows: 22213
wc -l downloads/feature-classifier/unlabelled-changesets.csv


# Merge both labelled and unlabelled changesets.
cat downloads/feature-classifier/labelled-changesets.csv downloads/feature-classifier/unlabelled-changesets.csv > downloads/feature-classifier/changesets.csv

# Number of rows: 34274
wc -l downloads/feature-classifier/changesets.csv
```

#### 2. Download more data about changesets.
```sh

npm install minimist csv d3-queue request mkdirp real-changesets-parser @turf/turf underscore  moment @mapbox/osm-compare simple-statistics naughty-words

mkdir -p data && mkdir -p data/feature-classifier/

# Download real changesets.
node data/feature-classifier/download-real-changesets.js \
    --changesets downloads/feature-classifier/changesets.csv \
    --directory downloads/feature-classifier/

# Download user details.
node data/feature-classifier/download-user-details.js \
    --changesets downloads/feature-classifier/changesets.csv \
    --realChangesetsDirectory downloads/feature-classifier/real-changesets/ \
    --directory downloads/feature-classifier/
```


#### 3. Extract attributes.

```sh
# Extract attributes using changesets from osmcha, real changesets and user details.
node data/feature-classifier/extract-attributes.js \
    --changesets downloads/feature-classifier/changesets.csv \
    --realChangesetsDir downloads/feature-classifier/real-changesets/ \
    --userDetailsDir downloads/feature-classifier/user-details/ > downloads/feature-classifier/attributes.csv

# Compress all files.
tar -czf dataset-2017-06-07.tar.gz downloads/
aws s3 cp dataset-2017-06-07.tar.gz s3://mapbox-gabbar/public/datasets/feature-classifier/raw/ --region 'us-west-2'

# To download it back.
aws s3 cp s3://mapbox-gabbar/public/datasets/feature-classifier/raw/dataset-2017-06-07.tar.gz . --region 'us-west-2'
```


## Locally

```sh
# Modify URL in `clean_data_from_osmcha.ipnb` and run notebook.

# Copy over dataset over to s3.
aws s3 cp downloads/changesets-filtered.csv s3://mapbox-gabbar/public/datasets/feature-classifier/testing/changesets.csv --region 'us-west-2'

# Move over to the remote section and come back once done.
# ...

cd downloads/feature-classifier/testing/
aws s3 sync s3://mapbox-gabbar/public/datasets/feature-classifier/testing/ . --region 'us-west-2'


# Should be all set to run `feature_classifier.ipnb`
# ...
```



## Remote


```sh
# Check all files on s3.
aws s3 ls --recursive --human-readable s3://mapbox-gabbar/public/datasets/feature-classifier/

cd /mnt/data/
mkdir -p gabbar && cd gabbar

# Download changesets.
aws s3 sync s3://mapbox-gabbar/public/datasets/feature-classifier/testing/ downloads

# Copy over script to download real changesets.
vim download-real-changesets.js

# Install required packages.
npm install csv d3-queue request mkdirp minimist

# Download real changesets.
node download-real-changesets.js --changesets downloads/changesets.csv --directory downloads/

# Compress and upload to S3.
cd downloads
tar -czf real-changesets.tar.gz real-changesets/
aws s3 cp real-changesets.tar.gz s3://mapbox-gabbar/public/datasets/feature-classifier/testing/
cd ..


# Download user details.
vim download-user-details.js

npm install real-changesets-parser

node download-user-details.js \
    --changesets downloads/changesets.csv \
    --realChangesetsDirectory downloads/real-changesets/ \
    --directory downloads/

cd downloads
tar -czf user-details.tar.gz user-details/
aws s3 cp user-details.tar.gz s3://mapbox-gabbar/public/datasets/feature-classifier/testing/
cd ..


# Extract features.
vim extract-features.js

npm install @turf/turf underscore moment naughty-words

node extract-features.js \
    --changesets downloads/changesets.csv \
    --realChangesetsDir downloads/real-changesets/ \
    --userDetailsDir downloads/user-details/ > downloads/attributes.csv
aws s3 cp downloads/attributes.csv s3://mapbox-gabbar/public/datasets/feature-classifier/testing/attributes.csv

```
