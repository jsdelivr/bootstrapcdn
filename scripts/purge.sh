#!/bin/bash

for l in `echo $(find public/bootstrap/latest/ -type f)`
do
  file=$(echo $l | sed 's/public\///')
  path="https://maxcdn.bootstrapcdn.com/purge/$file"
  echo ">> $path"
  curl -sI $path | grep "^HTTP"
done
