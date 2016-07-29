'use strict';

require('shelljs/make');
var path = require('path');
var http = require('http');
var fs   = require('fs');

var MOCHA      = path.join(__dirname, 'node_modules/.bin/mocha');
var BOOTLINT   = path.join(__dirname, 'node_modules/.bin/bootlint');
var FOREVER    = path.join(__dirname, 'node_modules/.bin/forever');
var MOCHA_OPTS = ' --timeout 15000 --slow 500';

(function() {
    cd(__dirname);

    function assert(result) {
        if (result.code !== 0) {
            process.exit(result.code);
        }
    }
    function assertExec(cmd, options) {
        if (options) {
            assert(exec(cmd, options));
        }

        assert(exec(cmd));
    }

    //
    // make test
    //
    target.test = function() {
        // without functional tests
        assertExec(MOCHA + MOCHA_OPTS + ' -i -g "functional" -R spec ./tests/');
    };

    target.suite = function() {
        assertExec(MOCHA + MOCHA_OPTS + ' -R dot ./tests/');
    };

    target.functional = function() {
        assertExec(MOCHA + MOCHA_OPTS + ' -R tap ./tests/functional_test.js');
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
        assertExec('node app.js');
    };

    // for functional tests
    target.start = function() {
        var env = process.env;

        if (!env.NODE_ENV) {
            env.NODE_ENV = 'production';
        }

        assertExec(FOREVER + ' --plain start app.js', { env: env });
    };
    target.stop = function() {
        assertExec(FOREVER + ' stop app.js');
    };
    target.restart = function() {
        assertExec(FOREVER + ' stop app.js');
        assertExec(FOREVER + ' --plain start app.js');
    };

    //
    // make travis
    //
    target.travis = function() {
        target.suite();
        target.bootlint();
    };

    //
    // make wp-plugin
    //
    target['wp-plugin'] = function() {
        echo('node ./scripts/wp-plugin.js');
        assertExec('node ./scripts/wp-plugin.js');
    };

    target['purge-latest'] = function() {
        // TODO: Make pure JS
        echo('bash ./scripts/purge.sh');
        assertExec('bash ./scripts/purge.sh');
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
            echo('+ curl http://localhost:' + port + '/ > ' + output);
            var request = http.get('http://localhost:' + port + '/', function(response) {
                response.pipe(file);

                response.on('end', function() {
                    file.close();

                    echo('+ bootlint ' + output);

                    // disabling version error's until bootswatch is updated to 3.3.4
                    var res = exec(BOOTLINT + ' -d W013 ' + output);

                    echo('+ node make stop');
                    target.stop();

                    rm(output);

                    if (res.stdout.indexOf("0 lint error(s) found") < 0) {
                        process.exit(1);
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
        echo('  test        runs unit tests');
        echo('  functional  runs functional tests');
        echo('  suite       runs unit and functional tests');
        echo('  clean       cleanup working directory');
        echo('  run         runs for development mode');
        echo('  bootlint    run Bootlint locally');
        echo('  help        shows this help message');
    };

}());
