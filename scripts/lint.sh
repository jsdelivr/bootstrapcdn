#!/bin/bash

test $1 || exit 1
./node_modules/.bin/uglifyjs public/bootlint/$1/bootlint.js -o public/bootlint/$1/bootlint.min.js --comments all

