#!/usr/bin/env node

'use strict';

const fs         = require('fs');
const path       = require('path');
const yaml       = require('js-yaml');
const config     = require('../config');
const { digest } = require('./sri.js');

const filesConfig = config.loadConfig('_files.yml');
const configFile = config.getConfigPath('_files.yml');

// create backup file
fs.createReadStream(configFile)
    .pipe(fs.createWriteStream(`${configFile}.bak`));

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

// bootswatch{3,4}
((() => {
    ['bootswatch3', 'bootswatch4'].forEach((key) => {
        const bootswatch = buildPath(filesConfig[key].bootstrap);

        for (const theme of filesConfig[key].themes) {
            const file = bootswatch.replace('SWATCH_VERSION', filesConfig[key].version)
                                 .replace('SWATCH_NAME', theme.name);

            if (exists(file)) { // always regenerate
                theme.sri = digest(file);
            }
        }
    });
}))();

// bootlint
((() => {
    for (const bootlint of filesConfig.bootlint) {
        const file = buildPath(bootlint.javascript);

        if (exists(file)) { // always regenerate
            bootlint.javascriptSri = digest(file);
        }
    }
}))();

// bootstrap
((() => {
    for (const bootstrap of filesConfig.bootstrap) {
        let { javascriptBundle } = bootstrap;

        const javascript = buildPath(bootstrap.javascript);
        const stylesheet = buildPath(bootstrap.stylesheet);

        if (javascriptBundle) {
            javascriptBundle = buildPath(bootstrap.javascriptBundle);
        }

        if (exists(javascript)) {
            bootstrap.javascriptSri = digest(javascript);
        }

        if (javascriptBundle && exists(javascriptBundle)) {
            bootstrap.javascriptBundleSri = digest(javascriptBundle);
        }

        if (exists(stylesheet)) {
            bootstrap.stylesheetSri = digest(stylesheet);
        }
    }
}))();

// fontawesome
((() => {
    for (const fontawesome of filesConfig.fontawesome) {
        const stylesheet = buildPath(fontawesome.stylesheet);

        if (exists(stylesheet)) {
            fontawesome.stylesheetSri = digest(stylesheet);
        }
    }
}))();

fs.writeFileSync(configFile,
    yaml.dump(filesConfig, {
        lineWidth: -1
    })
);
