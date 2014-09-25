test:
	npm run test

setup: logs
	npm run setup

clean:
	rm -rf node_modules

run:
	node app.js

start:
	npm run start

stop:
	npm run stop

restart:
	npm run restart

status:
	npm run status

logs:
	mkdir logs

nginx/start: nginx.conf
	sudo /usr/local/nginx/sbin/nginx -c /home/$(USER)/bootstrap-cdn/nginx.conf

nginx/stop:
	sudo pkill -9 nginx

nginx/restart: nginx/stop nginx/start

nginx/reload: nginx.conf
	sudo pkill -HUP nginx

nginx.conf: .PHONY
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf

# Generate wp-plugin
###
wp-plugin: setup
	node ./scripts/wp-plugin.js

bootlint: setup
	make start
	@sleep 3
	curl http://localhost:3333/ > lint.html
	-./node_modules/.bin/bootlint lint.html
	make stop
	rm lint.html

.PHONY:
# vim: ft=make:
