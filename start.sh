#!/bin/bash

UPDATE_NODE_MODULES=./update-npm.conf
if test -f "$UPDATE_NODE_MODULES"; then
    echo "Updating node_modules"
    /usr/local/bin/npm ci
    rm ./update-npm.conf
fi

/usr/local/bin/node ./src/app.js