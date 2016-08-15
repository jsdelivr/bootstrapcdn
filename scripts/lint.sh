#!/bin/bash

root=$(pwd)
version=$1

if ! test "$version"; then
  echo "Valid Bootlint version required."
  exit 1
fi

# strip leading 'v' if present
version=`echo $version | sed 's/^v//'`

# ensure
test -x ./node_modules/.bin/uglifyjs || npm install

pushd public/bootlint/$version

set -uex
$root/node_modules/.bin/uglifyjs bootlint.js -o bootlint.min.js \
  --compress --source-map bootlint.min.js.map \
  --comments "/(?:^!|@(?:license|preserve|cc_on))/"

popd
