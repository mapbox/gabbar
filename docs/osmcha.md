# osmcha


```bash
mkdir -p downloads/dataset/

# Update the url in the script before running.
node data/feature-classifier/download-osmcha.js > downloads/dataset/changesets.csv

# 13062 samples on 2017-06-21
wc -l downloads/dataset/changesets.csv
```
