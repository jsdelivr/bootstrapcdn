'use strict';

const fs  = require('fs');
const sri = require('sri-toolbox');

// create datestamp on startup
const cacheBuster = Date.now().toString();

function buster(uri) {
    return `${uri}?${cacheBuster}`;
}

function sriDigest(file, fromString) {
    file = fromString ? file : fs.readFileSync(file);
    return sri.generate({ algorithms: ['sha384'] }, file);
}

function selectedTheme(config, selected) {
    if (typeof selected === 'undefined') {
        return config.theme;
    }

    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
        parseInt(selected, 10) : config.theme;
}

function getTheme(config, selected) {
    const themes = config.bootswatch.themes;

    selected = selectedTheme(config, selected);

    return {
        uri: config.bootswatch.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch.version)
                .replace('SWATCH_NAME', themes[selected].name),
        sri: themes[selected].sri
    };
}


module.exports = {
    theme: {
        selected: selectedTheme,
        fetch: getTheme
    },
    sri: {
        digest: sriDigest
    },
    buster
};

// vim: ft=javascript sw=4 sts=4 et:
