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
