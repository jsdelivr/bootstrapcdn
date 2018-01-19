#!/usr/bin/env node

'use strict';

const fs         = require('fs');
const path       = require('path');
const yaml       = require('js-yaml');
const sri        = require('./sri.js');

const basedir    = path.join(__dirname, '..');
const configFile = path.join(basedir, 'config', '_config.yml');
const config     = yaml.safeLoad(fs.readFileSync(configFile));

// create backup file
fs.createReadStream(configFile)
    .pipe(fs.createWriteStream(`${configFile}.bak`));

function buildPath(d) {
    d = d.replace('/bootstrap/', '/twitter-bootstrap/')
         .replace('https://maxcdn.bootstrapcdn.com/', '');
    return path.join(basedir, 'public', d);
}

function exists(file) {
    const found = fs.existsSync(file);

    if (!found) {
        console.log('WARNING: %s not found', file);
    }
    return found;
}

// our css files
((() => {
    for (const css of config.stylesheet) {
        const file = buildPath(css.uri);

        if (exists(file)) { // always regenerate
            css.sri = sri.digest(file);
        }
    }
}))();

// our js files
((() => {
    for (const js of config.javascript) {
        const file = buildPath(js.uri);

        if (exists(file)) { // always regenerate
            js.sri = sri.digest(file);
        }
    }
}))();

// bootswatch{3,4}
((() => {
    ['bootswatch3', 'bootswatch4'].forEach((key) => {
        const bootswatch = buildPath(config[key].bootstrap);

        for (const theme of config[key].themes) {
            const file = bootswatch.replace('SWATCH_VERSION', config[key].version)
                                 .replace('SWATCH_NAME', theme.name);

            if (exists(file)) { // always regenerate
                theme.sri = sri.digest(file);
            }
        }
    });
}))();

// bootlint
((() => {
    for (const bootlint of config.bootlint) {
        const file = buildPath(bootlint.javascript);

        if (exists(file)) { // always regenerate
            bootlint.javascriptSri = sri.digest(file);
        }
    }
}))();

// bootstrap
((() => {
    for (const bootstrap of config.bootstrap) {
        // Skip when the key doesn't exist
        if (typeof bootstrap.javascriptBundle === 'undefined') {
            continue;
        }

        const javascript = buildPath(bootstrap.javascript);
        const javascriptBundle = buildPath(bootstrap.javascriptBundle);
        const stylesheet = buildPath(bootstrap.stylesheet);

        if (exists(javascript)) {
            bootstrap.javascriptSri = sri.digest(javascript);
        }

        if (exists(javascriptBundle)) {
            bootstrap.javascriptBundleSri = sri.digest(javascriptBundle);
        }

        if (exists(stylesheet)) {
            bootstrap.stylesheetSri = sri.digest(stylesheet);
        }
    }
}))();

// fontawesome
((() => {
    for (const fontawesome of config.fontawesome) {
        const stylesheet = buildPath(fontawesome.stylesheet);

        if (exists(stylesheet)) {
            fontawesome.stylesheetSri = sri.digest(stylesheet);
        }
    }
}))();

fs.writeFileSync(configFile, yaml.dump(config, { lineWidth: -1 }));
