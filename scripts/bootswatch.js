#!/usr/bin/env node

'use strict';

const yaml    = require('js-yaml');
const path    = require('path');
const fs      = require('fs');
const request = require('request');

const version = process.argv[2];

if (!version) {
    console.log('Please pass the Bootswatch version as an argument.');
    process.exit(1);
}

const basedir       = path.join(__dirname, '..');
const bootswatchDir = path.join(basedir, 'public', 'bootswatch', version);
const configFile    = path.join(basedir, 'config', '_config.yml');

const config = yaml.safeLoad(fs.readFileSync(configFile));

const files = [
    'https://www.bootswatch.com/%s/bootstrap.min.css',
    'https://www.bootswatch.com/%s/bootstrap.css'
];

const fonts    = 'https://www.bootswatch.com/fonts/%s';
const fontsDir = path.join(bootswatchDir, 'fonts');

function errorCheck(err) {
    if (err) {
        console.trace(err);
        process.exit(1);
    }
}

function checkDirSync(dir) {
    try {
        fs.statSync(dir);
    } catch (e) {
        fs.mkdirSync(dir);
        console.log('Created: %s', dir);
    }
}

checkDirSync(bootswatchDir);

files.forEach((file) => {
    config.bootswatch.themes.forEach((theme) => {
        const source = file.replace('%s', theme.name);

        request.get(source, (err, res, body) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            if (res.statusCode !== 200) {
                console.log(source, 'not found');
                return;
            }
            const targetDir = path.join(bootswatchDir, theme.name);

            checkDirSync(targetDir);

            const target = path.join(targetDir, path.basename(file));

            fs.writeFileSync(target, body);
            console.log('  Saved: %s', target);
            console.log('    From: %s', source);
        });
    });
});

checkDirSync(fontsDir);

['glyphicons-halflings-regular.eot',
    'glyphicons-halflings-regular.svg',
    'glyphicons-halflings-regular.ttf',
    'glyphicons-halflings-regular.woff',
    'glyphicons-halflings-regular.woff2'
].forEach((font) => {
    const fontPath = fonts.replace('%s', font);
    const target   = path.join(fontsDir, font);

    request
        .get(fontPath)
        .on('response', (res) => {
            if (res.statusCode !== 200) {
                errorCheck(new Error(`Non-success status code: ${res.statusCode}`));
            }
            console.log('  Saved: %s', target);
            console.log('    From: %s', fontPath);
        })
        .on('error', (err) => {
            console.trace(err);
        })
        .pipe(fs.createWriteStream(target));
});

process.on('exit', (code) => {
    if (code === 0) {
        console.log('Don\'t forget to update the symlink and config file!');
    }
});
