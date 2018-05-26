#!/usr/bin/env node

const fs      = require('fs');
const path    = require('path');
const request = require('request');
const config  = require('../config');

const version  = process.argv[2];
const verMajor = version[0];

if (!version) {
    console.log('Please pass the Bootswatch version as an argument.');
    process.exit(1);
}

const bootswatchDir = path.join(__dirname, '../cdn/bootswatch', version);

const files = [
    'https://bootswatch.com/%d/%s/bootstrap.min.css',
    'https://bootswatch.com/%d/%s/bootstrap.css'
];

const fonts    = 'https://bootswatch.com/3/fonts/%s';
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
    } catch (err) {
        fs.mkdirSync(dir);
        console.log('Created: %s', dir);
    }
}

checkDirSync(bootswatchDir);

const bootswatchConf = config[`bootswatch${verMajor}`];

files.forEach((file) => {
    bootswatchConf.themes.forEach((theme) => {
        const source = file.replace('%s', theme.name).replace('%d', verMajor);

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

if (verMajor === '3') {
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
}
