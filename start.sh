#!/bin/bash

UPDATE_NODE_MODULES=./update-npm.conf
if test -f "$UPDATE_NODE_MODULES"; then
    echo "Updating node_modules"
    npm ci
    rm ./update-npm.conf
fi

node ./src/app.js