#!/bin/bash

#todo: clean up output, add colors

time curl -I www.bootstrapcdn.com
time curl -I netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css
time curl -I netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.js
time curl -I netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css
time curl -I netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css

time curl -I netdna.bootstrapcdn.com/bootswatch/3.0.0/amelia/bootstrap.min.css
time curl -I netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css

for ext in woff ttf svg eot otf; 
	do curl -I netdna.bootstrapcdn.com/font-awesome/latest/font/fontawesome-webfont.{$ext};
done
	
	