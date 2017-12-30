#!/bin/bash

npm pack ./
rm -Rf ./test/package
tar -xzf vuex-map-fields-*.tgz -C ./test
# Rename the fake published package to prevent Jest from
# complaining about two packages having the same name.
sed -i -e 's/vuex-map-fields/fake-vuex-map-fields/g' ./test/package/package.json
