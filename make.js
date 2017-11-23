/* eslint-env shelljs */
'use strict';

require('shelljs/make');

const path       = require('path');
const http       = require('http');
const fs         = require('fs');
const async      = require('async');

const MOCHA      = path.join(__dirname, 'node_modules/.bin/mocha');
const ESLINT     = path.join(__dirname, 'node_modules/.bin/eslint');
const BOOTLINT   = path.join(__dirname, 'node_modules/.bin/bootlint');
const PUGLINT    = path.join(__dirname, 'node_modules/.bin/pug-lint');
const FOREVER    = path.join(__dirname, 'node_modules/.bin/forever');
const HTMLLINT   = path.join(__dirname, 'node_modules/.bin/html-validator');

const MOCHA_OPTS = ' --timeout 15000 --slow 500 --exit';

cd(__dirname);

function assertExec (cmd, options) {
    const res = options ? exec(cmd, options) : exec(cmd);

    if (res.code !== 0) {
        process.exit(res.code);
    }

    return res;
}

target.test = () => {
    // without functional tests
    assertExec(`${MOCHA}${MOCHA_OPTS} -i -g "functional" -R spec ./tests/`);
};

target.suite = () => {
    assertExec(`${MOCHA}${MOCHA_OPTS} -R dot ./tests/`);
};

target.eslint = () => {
    echo('+ eslint .');
    assertExec(`${ESLINT} .`);
};

target.puglint = () => {
    echo('+ puglint .');
    assertExec(`${PUGLINT} .`);
};

target.lint = () => {
    target.eslint();
    target.puglint();
    target.bootlint();
    target.htmllint();
};

target.functional = () => {
    assertExec(`${MOCHA}${MOCHA_OPTS} -R tap ./tests/functional_test.js`);
};

target.clean = () => {
    rm('-rf', 'node_modules');
};

target.run = () => {
    assertExec('node app.js');
};

// for functional tests
target.start = () => {
    const env = process.env;

    if (!env.NODE_ENV) {
        env.NODE_ENV = 'production';
    }

    exec(`${FOREVER} start --plain app.js`, { env });
};

target.stop = () => {
    assertExec(`${FOREVER} stop app.js`);
};

target.tryStop = () => {
    // ignore errors with noop function
    exec(`${FOREVER} stop app.js`, () => true);
};

target.restart = () => {
    target.tryStop();
    target.start();
};

target.travis = () => {
    target.lint();
    target.suite();
};

target.appveyor = () => {
    target.lint();

    // without functional tests
    assertExec(`${MOCHA}${MOCHA_OPTS} -i -g "functional" -R dot ./tests/`);
};

target['wp-plugin'] = () => {
    echo('node ./scripts/wp-plugin.js');
    assertExec('node ./scripts/wp-plugin.js');
};

target['purge-latest'] = () => {
    echo('bash ./scripts/purge.sh');
    assertExec('bash ./scripts/purge.sh');
};

target.bootlint = () => {
    const port = 3080;

    env.PORT = port;
    env.NODE_ENV = 'development';

    echo('+ Bootlint task');
    echo('+ node make start');

    target.start();

    const pages = [
        '',
        'fontawesome',
        'bootswatch',
        'bootlint',
        'legacy',
        'showcase',
        'integrations'
    ];

    const outputs = [];

    echo('------------------------------------------------');
    async.eachSeries(pages, (page, callback) => {
        const url = `http://localhost:${port}/${page}${page === '' ? '' : '/'}`;

        if (page !== '') {
            page += '_';
        }

        const output = path.join(__dirname, `${page}lint.html`);
        const file = fs.createWriteStream(output);

        // okay, not really curl, but it communicates
        echo(`+ curl ${url} > ${output}`);

        http.get(url, (response) => {
            response.pipe(file);

            response.on('end', () => {
                file.close();
                outputs.push(output);
                callback();
            });
        });
    }, () => {
        echo('+ node make tryStop');
        target.tryStop();

        echo(`+ bootlint ${outputs.join('\\\n\t')}`);

        // disabling latest version error
        exec(`${BOOTLINT} -d W013 ${outputs.join(' ')}`, (code) => {
            rm(outputs);
            process.exit(code);
        });
    });
};

target.htmllint = () => {
    const port = 3081;

    env.PORT = port;
    env.NODE_ENV = 'development';

    echo('+ HTML validation task');
    echo('+ node make start');

    target.start();

    const pages = [
        '',
        'fontawesome',
        'bootswatch',
        'bootlint',
        'legacy',
        'showcase',
        'integrations'
    ];

    let output = '';


    echo('------------------------------------------------');
    async.eachSeries(pages, (page, callback) => {
        const url = `http://localhost:${port}/${page}${page === '' ? '' : '/'}`;

        if (page !== '') {
            page += '_';
        }

        output = path.join(__dirname, `${page}lint.html`);
        const file = fs.createWriteStream(output);

        // okay, not really curl, but it communicates
        echo(`+ curl ${url} > ${output}`);

        file.on('open', () => {
            http.get(url, (res) => {
                res.pipe(file);
                res.on('error', (e) => {
                    callback(e);
                });
            });
        });

        file.on('finish', () => {
            file.close();

            echo(`+ html-validator --verbose --file=${output}`);

            exec(`${HTMLLINT} --verbose --format=text --file=${output}`, (code) => {
                rm(output);
                return callback(code === 0 ? null : 'HTML validation failed!');
            });
        });

    }, (err) => {
        echo('+ node make tryStop');
        target.tryStop();

        if (err) {
            echo(`${err}`);
            process.exit(1);
        }
    });
};

target.all = () => {
    target.test();
    target.run();
};

target.help = () => {
    echo('Available targets:');
    echo('  all         test and run');
    echo('  test        runs unit tests');
    echo('  functional  runs functional tests');
    echo('  suite       runs unit and functional tests');
    echo('  clean       clean up working directory');
    echo('  run         runs for development mode');
    echo('  lint        lint all the things');
    echo('  eslint      run eslint');
    echo('  bootlint    run Bootlint');
    echo('  puglint     run pug-lint');
    echo('  htmllint    run HTML validator');
    echo('  travis      run Travis CI checks');
    echo('  appveyor    run AppVeyor CI checks');
    echo('  help        shows this help message');
};

// vim: ft=javascript sw=4 sts=4 et:
