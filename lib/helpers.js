'use strict';

const fs  = require('fs');
const crypto = require('crypto');
const path = require('path');
const url = require('url');
const sri = require('sri-toolbox');

function buster(uri) {
    // Parse the uri
    const urlObj = url.parse(uri);

    const urlProtocol = urlObj.protocol;
    const urlPathname = urlObj.pathname;
    const urlHostname = urlObj.hostname;

    // The position of the last instance of forward slash,
    // including the slash itself
    const fileNamePos = urlPathname.lastIndexOf('/') + 1;
    // The position of the last instance of period,
    // without the period itself
    const fileExtPos = urlPathname.lastIndexOf('.');

    // The url part from the beginning until the last forward slash
    const pathnameWithoutFile = urlPathname.substring(0, fileNamePos);
    const filename = urlPathname.substring(fileNamePos, fileExtPos);
    const ext = urlPathname.substring(fileExtPos);

    const fileStr = fs.readFileSync(path.join(__dirname, '../public/', urlPathname));
    const hash = crypto.createHash('md5')
                    .update(fileStr)
                    .digest('hex')
                    .slice(0, 7);

    let bustedAsset = `${urlProtocol ? urlProtocol : ''}${urlHostname ? `//${urlHostname}` : ''}`;

    bustedAsset += `${pathnameWithoutFile + filename}.${hash}${ext}`;

    return bustedAsset;
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
    },
    buster
};

// vim: ft=javascript sw=4 sts=4 et:
