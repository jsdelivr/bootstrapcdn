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

nginx/reload:
	sudo pkill -HUP nginx

nginx.conf:
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf

.PHONY:
# vim: ft=make:
