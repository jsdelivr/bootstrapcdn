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
    let { javascriptBundle } = bootstrap;

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
});

// fontawesome
(() => {
    for (const fontawesome of files.fontawesome) {
        // Skip when the key doesn't exist
        if (typeof fontawesome.stylesheetAll === 'undefined') {
            continue;
        }

        if (typeof fontawesome.stylesheetBrands === 'undefined') {
            continue;
        }

        if (typeof fontawesome.stylesheetBrands === 'undefined') {
            continue;
        }

        if (typeof fontawesome.stylesheetRegular === 'undefined') {
            continue;
        }

        if (typeof fontawesome.stylesheetSolid === 'undefined') {
            continue;
        }

        const stylesheet = buildPath(fontawesome.stylesheet);
        const stylesheetAll = buildPath(fontawesome.stylesheetAll);
        const stylesheetBrands = buildPath(fontawesome.stylesheetBrands);
        const stylesheetRegular = buildPath(fontawesome.stylesheetRegular);
        const stylesheetSolid = buildPath(fontawesome.stylesheetSolid);

        if (exists(stylesheet)) {
            fontawesome.stylesheetSri = generateSri(stylesheet);
        }

        if (exists(stylesheetAll)) {
            fontawesome.stylesheetAllSri = generateSri(stylesheetAll);
        }

        if (exists(stylesheetBrands)) {
            fontawesome.stylesheetBrandsSri = generateSri(stylesheetBrands);
        }

        if (exists(stylesheetRegular)) {
            fontawesome.stylesheetRegularSri = generateSri(stylesheetRegular);
        }

        if (exists(stylesheetSolid)) {
            fontawesome.stylesheetSolidSri = generateSri(stylesheetSolid);
        }
    }
})();

// Create backup file
fs.copyFileSync(configFile, `${configFile}.bak`);

fs.writeFileSync(configFile,
    yaml.dump(files, {
        lineWidth: -1
    })
);
