FOREVER=./node_modules/.bin/forever

setup: logs
	npm install

clean:
	rm -rf node_modules

run:
	node app.js

start:
	NODE_ENV=production $(FOREVER) -m 4 -p ./logs -l server.log --append --plain start server.js

stop:
	$(FOREVER) stop server.js

restart:
	$(FOREVER) restart server.js

status:
	$(FOREVER) list

logs:
	mkdir logs

.PHONY:
# vim: ft=make:
