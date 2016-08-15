#!/bin/bash

root=$(pwd)
version=$1

if ! test "$version"; then
  echo "Valid Bootlint version required."
  exit 1
fi

# strip leading 'v' if present
version=`echo $version | sed 's/^v//'`

if test -d public/bootlint/$version; then
  echo "Bootlint version already found."
  exit 1
fi

set -uex
mkdir public/bootlint/$version
pushd public/bootlint/$version

wget --output-document bootlint.js \
  https://raw.githubusercontent.com/twbs/bootlint/v$version/dist/browser/bootlint.js

cd ..
rm latest
ln -s $version latest
popd

$root/scripts/lint.sh $version

set +x
echo " "
echo "Do not forget to update 'config/_config.yml!'"
