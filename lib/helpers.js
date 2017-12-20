'use strict';

const fs  = require('fs');
const sri = require('sri-toolbox');

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
    const themes = config.bootswatch4.themes;

    selected = selectedTheme(config, selected);

    return {
        uri: config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
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
    }
};

// vim: ft=javascript sw=4 sts=4 et:
