'''
OpenStreetMap diary post: http://www.openstreetmap.org/user/manoharuss/diary/40118
'''

import pandas as pd
from sklearn.cross_validation import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import classification_report
from sklearn.externals import joblib

changesets = pd.read_csv('training/changesets.csv')

columns = ['create', 'modify', 'delete', 'harmful']
features = changesets[columns]
features = features.dropna()

X = features.drop('harmful', axis=1)
y = features['harmful']
Xtrain, Xtest, ytrain, ytest = train_test_split(X, y, train_size=0.7, random_state=1)

print('Training the model ...')
model = SVC(kernel='rbf')
model.fit(Xtrain, ytrain)

y_model = model.predict(Xtest)
print(classification_report(ytest, y_model, labels=[True, False], target_names=['problematic', 'not problematic']))

joblib.dump(model, 'gabbar.pkl')
