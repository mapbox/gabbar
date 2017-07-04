# Analyze predictions


## Scripts

```bash
# Number of predictions: 6088
aws s3 ls s3://mapbox-gabbar/public/predictions/testing/ --region 'us-west-2' | wc -l

# Download predictions to a local folder
aws s3 sync s3://mapbox-gabbar/public/predictions/testing/ --region 'us-west-2' downloads/predictions/testing/

# Analyze predictions.
node datasets/analyze-predictions.js --predictionsDir downloads/predictions/testing/
```
