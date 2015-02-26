'use strict';

require('shelljs/make');
var path = require('path');
var http = require('http');
var fs   = require('fs');

var FOREVER = path.join(__dirname, 'node_modules/.bin/forever');
var MOCHA = path.join(__dirname, 'node_modules/.bin/mocha');
var BOOTLINT = path.join(__dirname, 'node_modules/.bin/bootlint');
var VALIDATOR = path.join(__dirname, 'node_modules/.bin/html-validator');


(function() {
    cd(__dirname);

    //
    // make test
    //
    target.test = function() {
        exec(MOCHA + ' --timeout 15000 ./tests/*_test.js ./tests/**/*_test.js -R spec');
    };

    //
    // make test-nc
    //
    target['test-nc'] = function() {
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
        env.NODE_ENV = 'production';
        exec(FOREVER + ' -p ./logs -l server.log --append --plain start server.js', { async: true });
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

    target['purge-latest'] = function() {
        // TODO: Make pure JS
        echo('bash ./scripts/purge.sh');
        exec('bash ./scripts/purge.sh');
    };

    //
    // make bootlint
    //
    target.bootlint = function() {
        echo('+ node make start');
        var port = 3080;
        env.PORT = port;
        target.start();

        // sleep
        setTimeout(function() {
            var output = path.join(__dirname, 'lint.html');
            var file = fs.createWriteStream(output);

            // okay, not really curl, but it communicates
            echo('+ curl http://localhost:'+port+'/ > ' + output);
            var request = http.get('http://localhost:'+port+'/', function(response) {
                response.pipe(file);

                response.on('end', function() {
                    file.close();

                    echo('+ bootlint ' + output);
                    exec(BOOTLINT + ' ' + output);

                    echo('+ node make stop');
                    target.stop();

                    rm(output);
                });
            });
        }, 2000);
    };

    //
    // make validator
    //
    target.validator = function() {
        echo('+ node make start');
        var port = 3080;
        env.PORT = port;
        target.start();

        // sleep
        setTimeout(function() {

            var output = path.join(__dirname, 'index.html');
            var file = fs.createWriteStream(output);

            // note; url version is failing due to a connection error, odd.

            // okay, not really curl, but it communicates
            echo('+ curl http://localhost:'+port+'/ > ' + output);
            var request = http.get('http://localhost:'+port+'/', function(response) {
                response.pipe(file);

                response.on('end', function() {
                    file.close();

                    echo('+ html-validator ' + output);
                    var res = exec(VALIDATOR + ' --file=' + output);

                    echo('+ node make stop');
                    target.stop();

                    rm(output);

                    if (res.output.indexOf('Error: ') !== -1) {
                        exit(1);
                    }
                });
            });
        }, 2000);
    };

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
        echo('  bootlint    run Bootlint locally');
        echo('  help        shows this help message');
    };

}());
