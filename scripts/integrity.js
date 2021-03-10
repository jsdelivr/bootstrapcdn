#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { files } = require('../config');
const { generateSri } = require('../lib/helpers');

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
['bootswatch3', 'bootswatch4'].forEach((key) => {
    const bootswatch = buildPath(files[key].bootstrap);

    files[key].themes.forEach((theme) => {
        const file = bootswatch.replace('SWATCH_VERSION', files[key].version)
            .replace('SWATCH_NAME', theme.name);

        if (exists(file)) {
            theme.sri = generateSri(file);
        }
    });
});

// Bootlint
files.bootlint.forEach((bootlint) => {
    const file = buildPath(bootlint.javascript);

    if (exists(file)) {
        bootlint.javascriptSri = generateSri(file);
    }
});

// Bootstrap
files.bootstrap.forEach((bootstrap) => {
    const javascript = buildPath(bootstrap.javascript);
    const stylesheet = buildPath(bootstrap.stylesheet);
    let { javascriptBundle, javascriptEsm } = bootstrap;

    if (javascriptBundle) {
        javascriptBundle = buildPath(bootstrap.javascriptBundle);
    }

    if (javascriptEsm) {
        javascriptEsm = buildPath(bootstrap.javascriptEsm);
    }

    if (exists(javascript)) {
        bootstrap.javascriptSri = generateSri(javascript);
    }

    if (javascriptBundle && exists(javascriptBundle)) {
        bootstrap.javascriptBundleSri = generateSri(javascriptBundle);
    }

    if (javascriptEsm && exists(javascriptEsm)) {
        bootstrap.javascriptEsmSri = generateSri(javascriptEsm);
    }

    if (exists(stylesheet)) {
        bootstrap.stylesheetSri = generateSri(stylesheet);
    }
});

// Font Awesome
files.fontawesome.forEach((fontawesome) => {
    const stylesheet = buildPath(fontawesome.stylesheet);

    if (exists(stylesheet)) {
        fontawesome.stylesheetSri = generateSri(stylesheet);
    }
});

// Create backup file
fs.copyFileSync(configFile, `${configFile}.bak`);

fs.writeFileSync(configFile,
    yaml.dump(files, {
        lineWidth: -1
    })
);
