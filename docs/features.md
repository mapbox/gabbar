========
Features
========


Add new feature
===============

*NOTE: By features, we mean attributes of the changeset (columns in a csv).*

1. Add a function in `gabbar.helpers.extractFeatures` that takes appropriate parameters and returns the feature.
    - Ex: `getBBOXArea(realChangeset)`
    - Potential parameters
        - `realChangeset` is raw real changeset from s3 is required. This has changeset metadata.
        - `changeset` is processed version of `realChangeset` is required.
    - Sync and Async
        - If calculating the feature is async in nature, use `Promises <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise>`_
2. Add appropriate name for the feature and result from the function to the `features` object in `gabbar.helpers.extractFeatures.extractFeatures`.
3. Add the feature name to the end of the formatted features list in `gabbar.helpers.extractFeatures.formatFeatures`
4. The new feature should now be part of the results from `data/extract_features.js`, :tada:
