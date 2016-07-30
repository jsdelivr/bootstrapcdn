'use strict';

// create datestamp on startup
var cacheBuster = Date.now().toString();

var sri = require('sri-toolbox');
var fs = require('fs');

function sriDigest(file, fromString) {
    file = fromString ? file : fs.readFileSync(file);
    return sri.generate({ algorithms: ['sha384'] }, file);
}

function selectedTheme(config, selected) {
    if (typeof selected === 'undefined' || selected === 'undefined') {
        return config.theme;
    }

    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
        parseInt(selected, 10) : config.theme;
}

function getTheme(config, selected) {
    selected   = selectedTheme(config, selected);
    var themes = config.bootswatch.themes;
    return {
        uri: config.bootswatch.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch.version)
                .replace('SWATCH_NAME',    themes[selected].name),
        sri: themes[selected].sri
    };
}

function randomTweets(tweets, limit) {
    limit = limit || 4;
    var retTweets = [];
    while (retTweets.length < limit) {
        var tweet = tweets[Math.floor(Math.random() * tweets.length)];
        if (retTweets.indexOf(tweet) === -1) {
            retTweets.push(tweet);
        }
    }
    return retTweets;
}

function cssWithBuster(uri, sri) {
    return '<link rel="stylesheet" href="' + uri + '?' + cacheBuster +
        '" integrity="' + sri + '" crossorigin="anonymous">';
};

function jsWithBuster(uri, sri) {
    return '<script src="' + uri + '?' + cachBuster +
        '" integrity="' + sri + '" crissorigin="anonymous"';
};

function imgWithBuster(uri, attributes) {
    var attrs = '';

    for (var key in attributes) {
        attrs += ' ' + key + '="' + attributes[key] + '"';
    }

    return '<img src="' + uri + '?' + cacheBuster + '"' + attrs + '>';
};

module.exports = {
    theme: {
        selected: selectedTheme,
        fetch: getTheme
    },
    randomTweets: randomTweets,
    sri: {
        digest: sriDigest
    },
    cacheBuster: {
        css: cssWithBuster,
        js: jsWithBuster,
        img: imgWithBuster
    }
};

// vim: ft=javascript sw=4 sts=4 et:
