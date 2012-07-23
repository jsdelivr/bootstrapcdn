#!/bin/bash

/usr/local/bin/python daily.getstats.py > ~/github/bootstrap-cdn/data/daily.stats.json 
cd ~/github/bootstrap-cdn/
/usr/bin/git checkout master
/usr/bin/git commit -am "updated daily.stats.json"
/usr/bin/git push origin master
