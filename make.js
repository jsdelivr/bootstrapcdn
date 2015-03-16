'use strict';

require('shelljs/make');
var path = require('path');
var http = require('http');
var fs   = require('fs');

var PM2 = path.join(__dirname, 'node_modules/.bin/pm2');
var FOREVER = path.join(__dirname, 'node_modules/.bin/forever');
var MOCHA = path.join(__dirname, 'node_modules/.bin/mocha');
var BOOTLINT = path.join(__dirname, 'node_modules/.bin/bootlint');
var VALIDATOR = path.join(__dirname, 'node_modules/.bin/html-validator');

(function() {
    cd(__dirname);

    function assert(result) {
        if (result.code !== 0)
            process.exit(result.code);
    }
    function assertExec(cmd) {
        assert(exec(cmd));
    }

    // make test
    target.test = function() {
        assertExec(MOCHA + ' --timeout 15000 ./tests/*_test.js ./tests/**/*_test.js -R spec');
    };

    // make test-nc
    target['test-nc'] = function() {
        assertExec(MOCHA + ' --no-colors --timeout 15000 ./tests/*_test.js ./tests/**/*_test.js -R spec');
    };

    // make clean
    target.clean = function() {
        rm('-rf', 'node_modules');
    };

    // make run
    target.run = function() {
        assertExec('node app.js');
    };

    target.log_dir = function() {
        if (!test('-e', 'logs')) {
            mkdir('logs');
        }
    };

    // make start
    target.start = function() {
        target.log_dir();
        assertExec(PM2 + ' startOrRestart ./bootstrapcdn.json');
    };

    target['start-test-app'] = function() {
        target.log_dir();
        env.NODE_ENV = 'production';
        assertExec(FOREVER + ' -p ./logs -l server.log --append --plain start server.js', { async: true });
    };

    target['stop-test-app'] = function() {
        assertExec(FOREVER + ' stop server.js');
    };

    // make reload
    // - roll restart
    target.reload = function() {
        assertExec(PM2 + ' -s restart bootstrap01');
        assertExec(PM2 + ' -s restart bootstrap02');
        assertExec(PM2 + ' -s restart bootstrap03');
        target.status();
    };

    // make restart
    target.restart = target.start;

    // stop
    target.stop = function() {
        assertExec(PM2 + ' delete ./bootstrapcdn.json');
    };

    // logs
    target.logs = function() {
        assertExec(PM2 + ' logs');
    };

    target.status = function() {
        assertExec(PM2 + ' list');
    };

    target.monit = function() {
        assertExec(PM2 + ' monit');
    }
    target.monitor = target.monit;


    // make travis
    target.travis = function() {
        target.test();
        target.bootlint();
        target.validator();
    };

    // make wp-plugin
    target['wp-plugin'] = function() {
        echo('node ./scripts/wp-plugin.js');
        assertExec('node ./scripts/wp-plugin.js');
    };

    target['purge-latest'] = function() {
        // TODO: Make pure JS
        echo('bash ./scripts/purge.sh');
        assertExec('bash ./scripts/purge.sh');
    };

    // make bootlint
    target.bootlint = function() {
        var port = 3080;
        env.PORT = port;
        echo('+ node make start-test-app');
        target['start-test-app']();

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

                    // disabling version error's until bootswatch is updated to 3.3.4
                    var res = exec(BOOTLINT + ' -d W013 ' + output);

                    echo('+ node make stop-test-app');
                    target['stop-test-app']();

                    rm(output);
                    assert(res);
                });
            });
        }, 2000);
    };

    // make validator
    target.validator = function() {
        var port = 3080;
        env.PORT = port;
        echo('+ node make start-test-app');
        target['start-test-app']();

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

                    echo('+ node make stop-test-app');
                    target['stop-test-app']();

                    rm(output);
                    assert(res);
                });
            });
        }, 2000);
    };

    // make help
    target.help = function() {
        echo('Available targets:');
        echo('  test        runs the tests');
        echo('  test-nc     runs the tests w/o colors');
        echo('  clean       cleanup working directory');
        echo('  run         runs for development mode');
        echo('  start       start application deamonized');
        echo('  stop        stop application deamonized');
        echo('  status      list application processes');
        echo('  monit       monitor application processes');
        echo('  bootlint    run Bootlint locally');
        echo('  validator   run html validator locally');
        echo('  help        shows this help message');
    };

}());
