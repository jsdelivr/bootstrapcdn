'use strict';

require('shelljs/make');
var path  = require('path');
var http  = require('http');
var fs    = require('fs');
var async = require('async');

var MOCHA      = path.join(__dirname, 'node_modules/.bin/mocha');
var BOOTLINT   = path.join(__dirname, 'node_modules/.bin/bootlint');
var FOREVER    = path.join(__dirname, 'node_modules/.bin/forever');
var MOCHA_OPTS = ' --timeout 15000 --slow 500';

(function() {
    cd(__dirname);

    var ignoreFailure = function() {};
    var handleFailure = function(code) {
        process.exit(code);
    };

    // map default execute with desired error handling
    var assertExec = function(cmd, options) {
        if (options) {
            exec(cmd, options, handleFailure);
        }

        exec(cmd, handleFailure);
    };

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
    target.start = function(callback) {
        var env = process.env;

        if (!env.NODE_ENV) {
            env.NODE_ENV = 'production';
        }

        exec(FOREVER + ' start --plain app.js', { env: env });
    };

    target.stop = function() {
        assertExec(FOREVER + ' stop app.js');
    };

    target.tryStop = function() {
        // use remapped default exec behavior from shelljs to ignore failures
        exec(FOREVER + ' stop app.js', ignoreFailure);
    };

    target.restart = function() {
        target.tryStop();
        target.start();
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
        env.NODE_ENV = 'development';
        target.start();

        var pages = [ '', 'fontawesome', 'bootswatch', 'bootlint', 'legacy',
            'showcase', 'integrations' ];

        var outputs = [];

        // sleep
        setTimeout(function() {
            echo('------------------------------------------------');
            async.eachSeries(pages, function(page, callback) {
                var url = 'http://localhost:' + port + '/' + page + (page !== '' ? '/' : '');

                if (page !== '') {
                    page += '_';
                }

                var output = path.join(__dirname, page + 'lint.html');
                var file = fs.createWriteStream(output);

                // okay, not really curl, but it communicates
                echo('+ curl ' + url + ' > ' + output);

                var request = http.get(url, function(response) {
                    response.pipe(file);

                    response.on('end', function() {
                        file.close();
                        outputs.push(output);
                        callback();
                    });
                });
            }, function() {
                echo('+ node make tryStop');
                target.tryStop();

                echo('+ bootlint ' + outputs.join('\\\n\t'));

                // disabling version error's until bootswatch is updated to 3.3.4
                exec(BOOTLINT + ' -d W013 ' + outputs.join(' '), function(code) {
                    rm(outputs);
                    handleFailure(code);
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
