#!/bin/bash

#todo: add functions, clean up output, add colors

#Origins
time curl -I www.bootstrapcdn.com
time curl -I http://s3-us-west-1.amazonaws.com/bootstrap-cdn/public/index.html
time curl -I http://s3-us-west-1.amazonaws.com/bootstrap-cdn/public/bootstrap/3.0.0/css/bootstrap.no-icons.min.css

#CDN
time curl -I netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css
time curl -I netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.js
time curl -I netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.no-icons.min.css

time curl -I netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css
time curl -I netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css

time curl -I netdna.bootstrapcdn.com/bootswatch/3.0.0/amelia/bootstrap.min.css
time curl -I netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css

#Fonts
for ext in woff ttf svg eot; 
	do curl -I netdna.bootstrapcdn.com/font-awesome/latest/font/fontawesome-webfont.{$ext};
done
	
	