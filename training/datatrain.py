import numpy as np
import pandas as pd
from sklearn import svm
from sklearn.cross_validation import train_test_split
from sklearn.externals import joblib
from sklearn.metrics import recall_score
from sklearn.metrics import precision_score
from sklearn.metrics import f1_score

index = "check date"
good=pd.read_csv('training/good.prep.csv', index_col=index).dropna()
problematic=pd.read_csv('training/problematic.prep.csv', index_col=index).dropna()

# Collect training/testing data
X = good
y = [+1] * good.shape[0]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=42)

# Load some abnormal observations
X_outliers = problematic

print('training samples: %d' % X_train.shape[0])
print('[testing] good samples: %d' % X_test.shape[0])
print('[testing] problematic samples: %d' % X_outliers.shape[0])

# Fit the model
clf = svm.OneClassSVM(nu=0.1, kernel="rbf", gamma=0.1)
clf.fit(X_train)

# Predictions
y_pred_test = clf.predict(X_test)
y_pred_outliers = clf.predict(X_outliers)

# Model evaluation
ground_truth = [+1] * X_test.shape[0] + [-1] * X_outliers.shape[0]
predictions = list(y_pred_test) + list(y_pred_outliers)

precision = precision_score(ground_truth, predictions)
recall = recall_score(ground_truth, predictions)
f1 = f1_score(ground_truth, predictions)
print('precision = %f' % precision)
print('recall = %f' % recall)
print('f1_score = %f' % f1)

# Exporting the model
joblib.dump(clf, 'training/gabbar.pkl')
