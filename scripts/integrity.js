#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { files } = require('../config');
const { generateSri } = require('./sri');

const configFile = path.resolve(__dirname, '../config/_files.yml');

function buildPath(dir) {
    dir = dir.replace('/bootstrap/', '/twitter-bootstrap/')
             .replace('https://stackpath.bootstrapcdn.com/', '');

    return path.join(__dirname, '../cdn', dir);
}

function exists(file) {
    const found = fs.existsSync(file);

    if (!found) {
        console.warn(`WARNING: ${file} not found`);
    }

    return found;
}

// Bootswatch {3,4}
((() => {
    ['bootswatch3', 'bootswatch4'].forEach((key) => {
        const bootswatch = buildPath(files[key].bootstrap);

        for (const theme of files[key].themes) {
            const file = bootswatch.replace('SWATCH_VERSION', files[key].version)
                                 .replace('SWATCH_NAME', theme.name);

            if (exists(file)) { // always regenerate
                theme.sri = generateSri(file);
            }
        }
    });
}))();

// Bootlint
((() => {
    for (const bootlint of files.bootlint) {
        const file = buildPath(bootlint.javascript);

        if (exists(file)) {
            bootlint.javascriptSri = generateSri(file);
        }
    }
}))();

// Bootstrap
((() => {
    for (const bootstrap of files.bootstrap) {
        let { javascriptBundle } = bootstrap;

        const javascript = buildPath(bootstrap.javascript);
        const stylesheet = buildPath(bootstrap.stylesheet);

        if (javascriptBundle) {
            javascriptBundle = buildPath(bootstrap.javascriptBundle);
        }

        if (exists(javascript)) {
            bootstrap.javascriptSri = generateSri(javascript);
        }

        if (javascriptBundle && exists(javascriptBundle)) {
            bootstrap.javascriptBundleSri = generateSri(javascriptBundle);
        }

        if (exists(stylesheet)) {
            bootstrap.stylesheetSri = generateSri(stylesheet);
        }
    }
}))();

// Font Awesome
((() => {
    for (const fontawesome of files.fontawesome) {
        const stylesheet = buildPath(fontawesome.stylesheet);

        if (exists(stylesheet)) {
            fontawesome.stylesheetSri = generateSri(stylesheet);
        }
    }
}))();

// Create backup file
fs.copyFileSync(configFile, `${configFile}.bak`);

fs.writeFileSync(configFile,
    yaml.dump(files, {
        lineWidth: -1
    })
);
