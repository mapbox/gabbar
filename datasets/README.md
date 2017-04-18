# README - Datasets


## Datasets

1. `s3://mapbox/gabbar/v1/reviewed_changesets.csv`
    - Changesets reviewed by users on [`osmcha.mapbox.com`](https://osmcha.mapbox.com/)

2. `s3://mapbox/gabbar/v1/reviewed_real_changesets.json`
    - Real changesets version of changesets reviewed by users on [`osmcha.mapbox.com`](https://osmcha.mapbox.com/)

3. `s3://mapbox/gabbar/v1/april_fools_changesets.csv`
    - All changesets on OpenStreetMap that occoured on April Fool's day.

4. `s3://mapbox/gabbar/v1/april_fools_real_changesets.json`
    - Real changesets version of all changesets on OpenStreetMap that occoured on April Fool's day.


## Setup

```sh
# Download and install Anaconda for Ubuntu x64.
cd ~
mkdir -p softwares && cd softwares
wget https://repo.continuum.io/archive/Anaconda3-4.3.1-Linux-x86_64.sh
bash Anaconda3-4.3.1-Linux-x86_64.sh
```


## Download datasets

```sh
# Directory to download datasets for version 1.
mkdir -p 'downloads/v1/'

# Download all changesets reviewed on osmcha.
wget 'http://osmcha.mapbox.com/?is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&sort=-date&render_csv=True' -O downloads/v1/reviewed_changesets.csv
wc -l downloads/v1/reviewed_changesets.csv

# Download real changesets for reviewed changesets from S3.
python datasets/real_changesets.py downloads/v1/reviewed_changesets.csv > downloads/v1/reviewed_real_changesets.csv
wc -l downloads/v1/reviewed_real_changesets.csv

# Download all changesets on April Fool's day.
wget 'http://osmcha.mapbox.com/?date__gte=2017-04-01&date__lte=2017-04-02&is_suspect=False&is_whitelisted=All&checked=All&all_reason=True&render_csv=True' -O downloads/v1/april_fools_changesets.csv
wc -l downloads/v1/april_fools_changesets.csv

# Download real changesets for all changesets on April Fool's day.
python datasets/real_changesets.py downloads/v1/april_fools_changesets.csv > downloads/v1/april_fools_real_changesets.csv
wc -l downloads/v1/april_fools_real_changesets.csv

```
