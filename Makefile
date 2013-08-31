FOREVER=./node_modules/.bin/forever

setup: logs
	npm install

clean:
	rm -rf node_modules

run:
	node app.js

start:
	NODE_ENV=production $(FOREVER) -p ./logs -l server.log --append --plain start app.js

stop:
	$(FOREVER) stop app.js

restart:
	$(FOREVER) restart app.js

status:
	$(FOREVER) list

logs:
	mkdir logs

.PHONY:
# vim: ft=make:
