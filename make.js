'use strict';

require('shelljs/make');
var path = require('path');
var http = require('http');
var fs   = require('fs');

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

    //
    // make wp-plugin
    //
    target['wp-plugin'] = function() {
        echo('node ./scripts/wp-plugin.js');
        exec('node ./scripts/wp-plugin.js');
    };

    //
    // make bootlint
    //
    target.bootlint = function() {
        echo('+ node make start');
        target.start();

        // sleep
        setTimeout(function() {
            var file = fs.createWriteStream("lint.html");

            // okay, not really curl, but it communicates
            echo('+ curl http://localhost:3333/ > ./lint.html');
            var request = http.get("http://localhost:3333/", function(response) {
              response.pipe(file);

              response.on('end', function() {
                  file.close();

                  echo('+ bootlint ./lint.html');
                  exec('./node_modules/.bin/bootlint ./lint.html');

                  echo('+ node make stop');
                  target.stop();

                  //rm('link.html');
              });
            });
        }, 2000);
    };

/*
 * Remains in Makefile
nginx/start: nginx.conf
	sudo /usr/local/nginx/sbin/nginx -c /home/$(USER)/bootstrap-cdn/nginx.conf

nginx/stop:
	sudo pkill -9 nginx

nginx/restart: nginx/stop nginx/start

nginx/reload:
	sudo pkill -HUP nginx

nginx.conf:
	sed -e "s/CURRENT_USER/$(USER)/g" .nginx.conf > nginx.conf
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
        echo('  all         test and run');
        echo('  test        runs the tests');
        echo('  test-nc     runs the tests w/o colors');
        echo('  clean       cleanup working directory');
        echo('  run         runs for development mode');
        echo('  start       start application deamonized');
        echo('  stop        stop application when deamonized');
        echo('  help        shows this help message');
    };

}());
