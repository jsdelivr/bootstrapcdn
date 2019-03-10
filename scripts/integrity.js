#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const config = require('../config');
const { generateSri } = require('./sri');

const filesConfig = config.loadConfig('_files.yml');
const configFile = config.getConfigPath('_files.yml');

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
        const bootswatch = buildPath(filesConfig[key].bootstrap);

        for (const theme of filesConfig[key].themes) {
            const file = bootswatch.replace('SWATCH_VERSION', filesConfig[key].version)
                                 .replace('SWATCH_NAME', theme.name);

            if (exists(file)) { // always regenerate
                theme.sri = generateSri(file);
            }
        }
    });
}))();

// Bootlint
((() => {
    for (const bootlint of filesConfig.bootlint) {
        const file = buildPath(bootlint.javascript);

        if (exists(file)) {
            bootlint.javascriptSri = generateSri(file);
        }
    }
}))();

// Bootstrap
((() => {
    for (const bootstrap of filesConfig.bootstrap) {
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
    for (const fontawesome of filesConfig.fontawesome) {
        const stylesheet = buildPath(fontawesome.stylesheet);

        if (exists(stylesheet)) {
            fontawesome.stylesheetSri = generateSri(stylesheet);
        }
    }
}))();

// Create backup file
fs.copyFileSync(configFile, `${configFile}.bak`);

fs.writeFileSync(configFile,
    yaml.dump(filesConfig, {
        lineWidth: -1
    })
);
