# Simple Makefile wrappers to support 'make <task>' over 'node make <task>'.
# This is a simple solution to avoid rewriting deployment automation.
###

all:
	node make all

test:
	node make test

test-nc:
	node make test-nc

travis: test bootlint

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

bootlint:
	node make bootlint

wp-plugin: setup
	node make wp-plugin

###
# Tasks which remain in Makefile only.
###

setup:
	npm run setup

nginx/start: nginx.conf
	sudo /usr/local/nginx/sbin/nginx -c /home/$(USER)/bootstrap-cdn/nginx.conf

nginx/stop:
	sudo pkill -9 nginx

nginx/restart: nginx/stop nginx/start

nginx/reload: nginx.conf
	sudo pkill -HUP nginx

nginx.conf: .PHONY
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf
