# Performance

### [Jupyter notebook](./notebooks/performance.ipynb)
- Hit rate for harmful predictions: `21.7`
- Hit rate for not harmful predictions: `90.0`


![index](https://cloud.githubusercontent.com/assets/2899501/25465904/df7055e2-2b22-11e7-96b7-70b278f2aec5.png)
*Hit rates for both harmful and not harmful predictions.*

![index](https://cloud.githubusercontent.com/assets/2899501/25465948/2ef6dbc2-2b23-11e7-9ac2-eb8bc767a984.png)
*Actual counts from the confusion matrix.*

## Methodology
- Download labelled changesets from osmcha for a particular date.
- Get predictions from the pre-trained model for these changesets.
- What does the confusion matrix look like and plot a graph of hit-rates.
