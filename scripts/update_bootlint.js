#!/usr/bin/env node

/* eslint-env shelljs */

'use strict';

require('shelljs/global');
const https     = require('https');
const fs        = require('fs');
const path      = require('path');

let version     = process.argv[2];

if (!version) {
    echo('Valid Bootlint version required.');
    process.exit(1);
}

// strip leading 'v' if present
version = version.replace(/^v/, '');

const basedir     = path.join(__dirname, '..');
const bootlintDir = path.join(basedir, 'public', 'bootlint', version);
const UGLIFYJS    = path.join(basedir, 'node_modules/.bin/uglifyjs');


if (test('-d', bootlintDir)) {
    echo('Bootlint version already found.');
    process.exit(1);
}

https.get(`https://raw.githubusercontent.com/twbs/bootlint/v${version}/dist/browser/bootlint.js`, (res) => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
        console.log(new Error(`Request Failed.\nStatus Code: ${statusCode}`).message);
        res.resume();
        return;
    }

    mkdir(bootlintDir);
    pushd(bootlintDir);

    const targetFile = 'bootlint.js';
    const targetMinFile = 'bootlint.min.js';
    const targetSourceMapFile = 'bootlint.min.js.map';
    const file = fs.createWriteStream(targetFile);

    res.pipe(file);

    res.on('end', () => {
        file.close();

        exec(`${UGLIFYJS} ${targetFile} -o ${targetMinFile} --compress --source-map ${targetSourceMapFile} --comments "/(?:^!|@(?:license|preserve|cc_on))/"`);

        cd('..');

        if (process.platform === 'win32') {
            fs.writeFileSync('latest', version, 'utf8');
        } else {
            rm('-f', 'latest');
            ln('-sf', version, 'latest');
        }

        popd();

        echo('\nDo not forget to update "config/_config.yml!"');
    });
});
