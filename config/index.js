'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadConfig(file) {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, file)), 'utf8');
}

['_app.yml', '_extras.yml', '_files.yml'].forEach((file) => {
    const name = file.replace(/^_/, '').replace(/.yml$/, '');

    module.exports[name] = loadConfig(file);
});

// vim: ft=javascript sw=4 sts=4 et:
