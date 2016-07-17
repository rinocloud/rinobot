#!/usr/bin/env bash

# delete the release folder if it exists
if [ -d "release" ]; then
  rm -r release
fi

# start packaging
./node_modules/.bin/cross-env NODE_ENV=production node -r babel-register ./scripts/package.js --all
