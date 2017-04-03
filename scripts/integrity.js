#!/usr/bin/env node

'use strict';

const fs         = require('fs');
const path       = require('path');
const yaml       = require('js-yaml');

const sri        = require(path.join(__dirname, 'sri'));

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

// bootswatch
((() => {
    const bootswatch = buildPath(config.bootswatch.bootstrap);

    for (const theme of config.bootswatch.themes) {
        const file = bootswatch.replace('SWATCH_VERSION', config.bootswatch.version)
                             .replace('SWATCH_NAME', theme.name);

        if (exists(file)) { // always regenerate
            theme.sri = sri.digest(file);
        }
    }
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

// bootstrap{4}
((() => {
    ['bootstrap', 'bootstrap4'].forEach((key) => {
        for (const bootstrap of config[key]) {
            const javascript = buildPath(bootstrap.javascript);
            const stylesheet = buildPath(bootstrap.stylesheet);

            if (exists(javascript)) {
                bootstrap.javascriptSri = sri.digest(javascript);
            }

            if (exists(stylesheet)) {
                bootstrap.stylesheetSri = sri.digest(stylesheet);
            }
        }
    });
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


fs.writeFileSync(configFile, yaml.dump(config, { lineWidth: 110 }));
