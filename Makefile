# Simple Makefile wrappers to support 'make <task>' over 'node make <task>'.
# This is a simple solution to avoid rewriting deployment automation.
###

all:
	node make all

test:
	node make test

test-nc:
	node make test-nc

clean:
	node make clean

run:
	node make run

start:
	node make start

stop:
	node make stop

restart:
	node make restart

status:
	node make status

help:
	node make help

###
# TODO: Consider moving the following tasks to 'make.js'
###

setup:
	npm run setup

nginx/start: nginx.conf
	sudo /usr/local/nginx/sbin/nginx -c /home/$(USER)/bootstrap-cdn/nginx.conf

nginx/stop:
	sudo pkill -9 nginx

nginx/restart: nginx/stop nginx/start

nginx/reload:
	sudo pkill -HUP nginx

nginx.conf:
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf

wp-plugin: setup
	node ./scripts/wp-plugin.js

bootlint: setup
	node make start
	@sleep 3
	curl http://localhost:3333/ > lint.html
	-./node_modules/.bin/bootlint lint.html
	node make stop
	rm lint.html

