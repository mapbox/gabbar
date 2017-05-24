# Datasets for feature classifier


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
