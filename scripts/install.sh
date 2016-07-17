#!/usr/bin/env bash

# this should install everything

git submodule update --init --recursive

# in the root electron folder
npm install

# in the app folder
cd app
npm install
cd ..

# in the rinobot.js submodule
cd app/rinobot.js
npm install
cd ..
cd ..

# in the rinocloud-javascript submodule
cd app/rinocloud-javascript
npm install
cd ..
cd ..
