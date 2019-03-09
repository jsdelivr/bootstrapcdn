'use strict';

const fs = require('fs');
const semver = require('semver');
const sri = require('sri-toolbox');

const config = require('../config');

function sriDigest(file, fromString) {
    file = fromString ? file : fs.readFileSync(file);

    return sri.generate({
        algorithms: ['sha384']
    }, file);
}

function selectedTheme(selected) {
    if (typeof selected === 'undefined' || selected === '') {
        return config.theme;
    }

    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
        parseInt(selected, 10) :
        config.theme;
}

function getTheme(selected) {
    const { themes } = config.bootswatch4;

    selected = selectedTheme(selected);

    return {
        uri: config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
                .replace('SWATCH_NAME', themes[selected].name),
        sri: themes[selected].sri
    };
}

function generateDataJson() {
    const data = {
        timestamp: new Date().toISOString(),
        bootstrap: {},
        fontawesome: {}
    };

    config.bootstrap.forEach((bootstrap) => {
        const bootstrapVersion = bootstrap.version;

        if (semver.satisfies(semver.coerce(bootstrapVersion), '<4')) {
            data.bootstrap[bootstrapVersion] = {
                css: bootstrap.stylesheet,
                js: bootstrap.javascript
            };
        }
    });

    config.fontawesome.forEach((fontawesome) => {
        data.fontawesome[fontawesome.version] = fontawesome.stylesheet;
    });

    return data;
}

module.exports = {
    generateDataJson,
    theme: {
        get: getTheme,
        selected: selectedTheme
    },
    sri: {
        digest: sriDigest
    }
};

// vim: ft=javascript sw=4 sts=4 et:
