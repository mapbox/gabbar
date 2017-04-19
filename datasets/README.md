# README - Datasets


## Datasets

1. `https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/reviewed_changesets.csv.tar.gz`
    - Changesets reviewed by users on [`osmcha.mapbox.com`](https://osmcha.mapbox.com/)

2. `https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/reviewed_real_changesets.csv.tar.gz`
    - Real changesets version of changesets reviewed by users on [`osmcha.mapbox.com`](https://osmcha.mapbox.com/)

3. `https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/april_fools_changesets.csv.tar.gz`
    - All changesets for a single day on OpenStreetMap.

4. `https://s3-us-west-2.amazonaws.com/mapbox-gabbar/public/april_fools_real_changesets.csv.tar.gz`
    - Real changesets version of all changesets for a single day on OpenStreetMap.


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
# Download all changesets reviewed on osmcha.
wget 'http://osmcha.mapbox.com/?is_suspect=False&is_whitelisted=All&harmful=None&checked=True&all_reason=True&sort=-date&render_csv=True' -O reviewed_changesets.csv

# Download real changesets for reviewed changesets from S3.
python datasets/real_changesets.py reviewed_changesets.csv > reviewed_real_changesets.csv

# Download all changesets on April Fool's day.
wget 'http://osmcha.mapbox.com/?date__gte=2017-04-01&date__lte=2017-04-02&is_suspect=False&is_whitelisted=All&checked=All&all_reason=True&render_csv=True' -O april_fools_changesets.csv

# Download real changesets for all changesets on April Fool's day.
python datasets/real_changesets.py april_fools_changesets.csv > april_fools_real_changesets.csv
```
