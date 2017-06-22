# Highway classifier


Attributes by action
- Create
    - Length of highway
- Modify
    - Change in length of highway
- Delete
    - Length of highway


## Questions
- Should there be separate attributes for new and old version of feature or should the diff be attributes themselves? Ex:
    - Diff attributes
        - Different in feature area
    - New and old version attributes
        - New version area
        - Old version area


## Attributes


#### Changeset attributes
- OneHotEncode the editor used
- Area of changeset bbox


#### User attributes
- Total changesets
- Total features
- Total mapping days
- Days since first edit using changeset date


#### Feature attributes (New version only)
- Property based
    - action (create, modify, delete)
    - version
    - Number of tags
    - name and name:en
        - Personal information. Ex: my, home
        - Profanity
    - primary tags
        - OneHotEncode all 26 primary tags with values from TagInfo
    - duplicate tags (TODO: Some research)
        - name_1, landuse_1, surface_1 etc
    - highway
        - OneHotEncode `residential` to `turning_circle` on TagInfo which have a fraction greater than 1%
        - Have `other` column for the rest
    - Combinations for highway except name, source, tiger, etc (TODO: Some research on what to ignore)
        - OneHotEncode `surface` to `width` on TagInfo which have a fraction greater than 1%
        - Have `other` column for the rest
        - Again, the values for these columns are from TagInfo
- Geometry based
    - Geometry type (Point, LineString, Polygon)
    - Length of highway between first and last node
    - Line distance of highway all along nodes
    - Number of nodes in highway
    - Mean distance between nodes in highway
    - Standard deviation of distance between nodes in highway
    - Number of kinks using `turf.kinks`
    - Area of bbox around highway


----




Data update
- 49563062 is good but labelled problematic
- https://osmcha.mapbox.com/48104772/ looks good too

Notes
- Use values for TagInfo whenever appropriate
- We could remove reverted changesets like https://osmcha.mapbox.com/47397324/ which could confuse the model
- Common classifier based on changeset comments. Ex: https://osmcha.mapbox.com/47469915/
- Looks like the model is solving something practically not possible with humans, use the 14GB TagInfo database.

Questions
- Should we have columns for diff parameters or should have have two columns one for new and another for old version.
- How to make use of other highway properties? We could try combinations from TagInfo.
    - surface
    - bicycle


Property based attributes
- Version of highway
- Name
    - Personal information. Ex: my, home, etc
    - Levenshtein distance
    - Profanity
- `highway` values
    - All values greater than 1% fraction will be separate columns along with other.
- Tags
    - Tags created
    - Tags modified
    - Tags deleted
- Highway `combination` values
- Number of primary tags other than highway
    - Should there be separate columns - https://osmcha.mapbox.com/47495399/
    - Adding `leisure=park`
    - Adding `landuse=forest` in https://osmcha.mapbox.com/48255854/
    - Adding `waterway=canal` in https://osmcha.mapbox.com/48270408/
    - Adding `waterway=stream` in https://osmcha.mapbox.com/48646176/
- Inappropriate combinations
    - `area=yes` and `highway=road` in https://osmcha.mapbox.com/48299400/
- Max speed from TagInfo
- Duplicate tags
    - name_1, landuse_1, surface_1 etc
- Percentage of tags
    - Created
    - Modified
    - Deleted
- Percentage of tag values
    - Created
    - Modified
    - Deleted

Geometry based attributes
- Length of highway between first and last node
- Line distance of highway all along nodes
- Number of nodes in highway
- Mean distance between nodes in highway
- Standard deviation of distance between nodes in highway
- Mean bearing between nodes in highway
- Standard deviation of bearing between nodes in highway
- Overlap in buffer around highway
- Area of turf.intersect between bbox's of new and old version of feature
- Number of kinks using `turf.kinks`
- Ratio of highway length to highway line distance


User
- Previous user of the feature the same?





































Notes
- Use log(value) when appropriate
- Similar attributes work for the feature's previous user

## Attributes

- Changeset
    - Editor used
    - Length in changeset comment
    - Imagery used
    - Host
    - Area of changeset bbox
    - Changeset features added
    - Changeset features modified
    - Changeset features deleted
- User
    - User name
        - Special characters in name
        - Any profanity in name
    - Days since first edit
        - Use first edit date and changeset date to calculate and not today.
    - User changesets
    - User features
    - Total discussions
    - Total changesets with discussions
    - User mapping days
    - Edit frequency mean
    - Edit frequency standard deviation
    - Average features touched per day since first edit
    - Average features touched per mapping days
    - Number of problematic changesets by the user on osmcha
- Feature
    - Property based attributes
        - Property transformation
        - Version
        - Days since feature edited
        - Number of attributes
        - Number of primary tags
            - Primary tags added
            - Primary tags modified
            - Primary tags deleted
            - Non primary tags added
            - Non primary tags modified
            - Non primary tags deleted
        - Number of name translations
        - Name
            - name
                - Length
                - Profanity
                - Levenshtein distance between name
            - name:en
                - Length
                - Profanity
                - Levenshtein distance between name:en
        - `highway`
            - Created
            - Modified
            - Deleted
        - `highway` values (boolean)
            - Everything greater than `0.00%` on TagInfo is a separate column
            - Others go into the `other` column
        - Tags
            - Created
            - Modified
            - Deleted
        - Values
            - Created
            - Modified
            - Deleted
        - Wikidata
        - Wikipedia
        - Percentage of tags modified
        - Percentage of values modified
    - Geometry based attributes
        - Geometry transformation
        - Feature type (node | way | polygon)
        - Length of highway
        - Number of nodes
        - Nodes per length
        - Area of bbox around highway
        - Percentage of changeset bbox covered by bbox around highway
        - Change in area of bbox around new and old version
        - Distance between centroids of new and old version
        - Percentage of geometry modified


```bash
mkdir -p downloads/ && mkdir -p downloads/highway-classifier/

node data/feature-classifier/highway-attributes.js \
    --changesets downloads/highway-classifier/changesets.csv \
    --realChangesetsDir downloads/highway-classifier/real-changesets/ \
    --userDetailsDir downloads/highway-classifier/user-details/ > downloads/highway-classifier/attributes.csv

```


https://github.com/mapbox/data/new/master/gists/bkowshik/new_?filename=scikit-vectorizer.ipynb
