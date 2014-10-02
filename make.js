'use strict';

require('shelljs/make');
var path = require('path');

var rootDir = path.join(__dirname + '/');
var FOREVER = path.join(__dirname, 'node_modules/.bin/forever');
var MOCHA = path.join(__dirname, 'node_modules/.bin/mocha');


(function() {
    cd(rootDir);

    //
    // make test
    //
    target.test = function() {
        exec(MOCHA + ' --timeout 15000 ./tests/*_test.js ./tests/**/*_test.js -R spec');
    };

    //
    // make test-nc
    //
    target["test-nc"] = function() {
        exec(MOCHA + ' --no-colors --timeout 15000 ./tests/*_test.js ./tests/**/*_test.js -R spec');
    };

    //
    // make clean
    //
    target.clean = function() {
        rm('-rf', 'node_modules');
    };

    //
    // make run
    //
    target.run = function() {
        exec('node app.js');
    };

    //
    // make start
    //
    target.start = function() {
        if (!test('-e', 'logs')) {
            mkdir('logs');
        }
        var NODE_ENV = 'production';
        exec(FOREVER + ' -m 4 -p ./logs -l server.log --append --plain start server.js');
    };

    //
    // make stop
    //
    target.stop = function() {
        exec(FOREVER + ' stop server.js');
    };

    //
    // make restart
    //
    target.restart = function() {
        exec(FOREVER + ' restart server.js');
    };

    //
    // make status
    //
    target.status = function() {
        exec(FOREVER + ' list');
    };

/*
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
	make start
	@sleep 3
	curl http://localhost:3333/ > lint.html
	-./node_modules/.bin/bootlint lint.html
	make stop
	rm lint.html
*/

    //
    // make all
    //
    target.all = function() {
        target.test();
        target.run();
    };


    //
    // make help
    //
    target.help = function() {
        echo('Available targets:');
        echo('  test        runs the tests');
        echo('  help        shows this help message');
    };

}());
