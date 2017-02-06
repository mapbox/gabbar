import pandas as pd


# Load datasets and select features
index = "check date"
features = ["create", "modify", "delete"]

# Reference: http://www.openstreetmap.org/user/manoharuss/diary/40118
url = 'https://www.dropbox.com/s/myuotkt7j123d35/changeset_export.csv?dl=1'
changesets = pd.read_csv(url, index_col=index).dropna()

good=changesets[changesets['harmful'] == False][features]
problematic=changesets[changesets['harmful'] == True][features]


# Write files to disk
good.to_csv("training/good.prep.csv")
problematic.to_csv("training/problematic.prep.csv")
