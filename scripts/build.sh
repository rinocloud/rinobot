#!/usr/bin/env bash

# this file builds the nessecary distribution files

# in the root electron folder
npm run build-fork
npm run build

# in the app folder
cd app
npm run build
cd ..
