'use strict';

require('shelljs/make');
var rootDir = __dirname + '/';      // absolute path to project's root
var FOREVER = rootDir + 'node_modules/.bin/forever';

(function() {
    cd(rootDir);

    //
    // make test
    //
    target.test = function() {
        exec(rootDir + 'node_modules/.bin/mocha' + ' tests/*_test.js tests/**/*_test.js -R spec');
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
        mkdir('logs');
        var NODE_ENV = 'production ' + FOREVER + ' -m 4 -p ./logs -l server.log --append --plain start server.js';
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

/*nginx/start: nginx.conf
	sudo /usr/local/nginx/sbin/nginx -c /home/$(USER)/bootstrap-cdn/nginx.conf

nginx/stop:
	sudo pkill -9 nginx

nginx/restart: nginx/stop nginx/start

nginx/reload:
	sudo pkill -HUP nginx

nginx.conf:
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf*/


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
