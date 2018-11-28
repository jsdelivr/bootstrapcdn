'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const csp = require('./helmet-csp.js');

function loadConfig(file) {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, file)), 'utf8');
}

function getConfigPath(file) {
    return path.join(__dirname, file);
}

['_app.yml', '_extras.yml', '_files.yml'].forEach((config) => {
    module.exports = Object.assign(loadConfig(config), module.exports);
});

module.exports.CSP = csp;
module.exports.getConfigPath = getConfigPath;
module.exports.loadConfig = loadConfig;

// vim: ft=javascript sw=4 sts=4 et:
