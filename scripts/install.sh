#!/usr/bin/env bash

# this should install everything
# in the root electron folder
npm install

# in the app folder
cd app
npm install
cd ..

# in the rinobot.js submodule
cd bot
npm install
cd ..

# in the rinocloud-javascript submodule
cd api
npm install
cd ..
