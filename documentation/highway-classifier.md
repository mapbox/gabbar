# Highway classifier


### 1. Download datasets

```bash
rm -Rf downloads/highway-classifier/
mkdir -p downloads && mkdir -p downloads/highway-classifier/

# Download labelled and unlabelled datasets.
aws s3 cp s3://mapbox-gabbar/dumps/labelled-2017-06-22.tar.gz downloads/highway-classifier/ --region 'us-west-2'
tar -xzf downloads/highway-classifier/labelled-2017-06-22.tar.gz -C downloads/highway-classifier/
mv downloads/highway-classifier/labelled-2017-06-22/ downloads/highway-classifier/labelled/

aws s3 cp s3://mapbox-gabbar/dumps/unlabelled-2017-06-22.tar.gz downloads/highway-classifier/ --region 'us-west-2'
tar -xzf downloads/highway-classifier/unlabelled-2017-06-22.tar.gz -C downloads/highway-classifier/
mv downloads/highway-classifier/unlabelled-2017-06-22 downloads/highway-classifier/unlabelled/
```

### 2. Get attributes from datasets

```bash
# Prepare a small sample for testing the scripts.
head -n100 downloads/highway-classifier/labelled/changesets.csv > downloads/highway-classifier/labelled/sample-changesets.csv

# Get attributes for labelled samples.
node datasets/highway-attributes.js \
    --realChangesetsDir downloads/highway-classifier/labelled/real-changesets/ \
    --userDetailsDir downloads/highway-classifier/labelled/user-details/ \
    --changesets downloads/highway-classifier/labelled/sample-changesets.csv > downloads/highway-classifier/labelled/attributes.csv

# Prepare a small sample for testing the scripts.
head -n100 downloads/highway-classifier/unlabelled/changesets.csv > downloads/highway-classifier/unlabelled/sample-changesets.csv

# Get attributes for unlabelled samples.
node datasets/highway-attributes.js \
    --realChangesetsDir downloads/highway-classifier/unlabelled/real-changesets/ \
    --userDetailsDir downloads/highway-classifier/unlabelled/user-details/ \
    --changesets downloads/highway-classifier/unlabelled/sample-changesets.csv > downloads/highway-classifier/unlabelled/attributes.csv
```
