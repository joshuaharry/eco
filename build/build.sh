#!/bin/sh
# This script is meant to be run with the npm CLI like so:
# 
# npm run build
set -e
printf "Generating JSON schema...\n";
node ./generate-schema.js
printf "Making ~/.eco...\n"
mkdir -p ~/.eco
printf "Copying over files...\n";
cp -r ./strategies ~/.eco
cp ./strategy-schema.json ~/.eco/strategies
printf "Compiling TypeScript...\n";
tsc
pkg . --out-path dist/ 
