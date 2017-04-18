# Datasets


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

# Download reviewed changesets from osmcha.
python datasets/reviewed_changesets.py \
    --filename downloads/real_changesets.csv

# Download real changesets for reviewed changesets from S3.
python datasets/real-changesets \
    --filename downloads/real_changesets.csv

```
