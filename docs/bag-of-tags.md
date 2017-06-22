# Bag of Tags


```bash

# Labelled samples.
node data/bag-of-tags/extract-attributes.js \
    --realChangesets downloads/bag-of-tags/real-changesets/ \
    --changesets downloads/bag-of-tags/changesets.csv \
    --userDetailsDir downloads/bag-of-tags/user-details/ > downloads/bag-of-tags/attributes.csv

# 2581 samples
wc -l downloads/bag-of-tags/attributes.csv

# Create a smaller sample of the test dataset.
head -n5000 downloads/unlabelled/changesets.csv > downloads/unlabelled/sample-changesets.csv

# Not labelled samples.
node data/bag-of-tags/extract-attributes.js \
    --realChangesets downloads/unlabelled/real-changesets/ \
    --changesets downloads/unlabelled/sample-changesets.csv \
    --userDetailsDir downloads/unlabelled/user-details/ > downloads/unlabelled/attributes.csv


# 98 samples
wc -l downloads/unlabelled/attributes.csv

```
