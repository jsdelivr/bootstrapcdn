// There is probably a better way, aside from passing config
// but I'll figure it out later.

'use strict';

function selectedTheme(config, selected) {
    if (typeof selected === 'undefined' || selected === 'undefined') {
        return config.theme;
    }

    return parseInt(selected, 10) === 0 || parseInt(selected, 10) ?
        parseInt(selected, 10) : config.theme;
}

function getTheme(config, selected) {
    selected   = selectedTheme(config, selected);
    var themes = config.bootswatch.themes.map(function(t) {
        return t.name;
    });

    return config.bootswatch.bootstrap
        .replace('SWATCH_VERSION', config.bootswatch.version)
        .replace('SWATCH_NAME',    themes[selected]);
}

function themeCSS(config, selected) {
    var file = getTheme(config, selected);

    if (process.env.NODE_ENV === 'development') {
        return file.replace('https://maxcdn.bootstrapcdn.com', '');
    }

    return file;
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

function calculateTotal(data, key) {
    var total = 0;
    data.forEach(function(item) {
        total = total + parseInt(item[key], 10);
    });
    return total;
}

module.exports = {
    theme: {
        selected:   selectedTheme,
        stylesheet: themeCSS
    },
    randomTweets:   randomTweets,
    calculateTotal: calculateTotal
};

// vim: ft=javascript sw=4 sts=4 et:
