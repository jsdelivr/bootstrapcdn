'use strict';

const CSP = {
    defaultSrc: ['\'self\''],
    baseUri: ['\'self\''],
    formAction: ['platform.twitter.com', 'syndication.twitter.com'],
    frameAncestors: ['\'none\''],
    scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'stackpath.bootstrapcdn.com',
        'www.google-analytics.com',
        'code.jquery.com',
        'platform.twitter.com',
        'api.github.com',
        'https://cdn.jsdelivr.net',
        'https://www.googletagmanager.com',
        (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'stackpath.bootstrapcdn.com',
        'fonts.googleapis.com',
        'platform.twitter.com',
        'https://cdn.jsdelivr.net'
    ],
    imgSrc: [
        '\'self\'',
        'data:',
        'www.google-analytics.com',
        'bootswatch.com',
        'syndication.twitter.com',
        'stats.g.doubleclick.net',
        'ad.doubleclick.net',
        '*.convertro.com',
        '*.c3tag.com',
        '*.2mdn.net',
        'launchbit.com',
        'www.launchbit.com',
        'https://cdn.jsdelivr.net'
    ],
    fontSrc: [
        '\'self\'',
        'stackpath.bootstrapcdn.com',
        'fonts.gstatic.com',
        'https://cdn.jsdelivr.net'
    ],
    frameSrc: [
        '\'self\'',
        'img.shields.io',
        'platform.twitter.com',
        'syndication.twitter.com',
        'https://cdn.jsdelivr.net',
        'https://github.com/sponsors/jsdelivr/button'
    ],
    childSrc: [
        '\'self\'',
        'img.shields.io',
        'platform.twitter.com',
        'syndication.twitter.com',
        'https://cdn.jsdelivr.net'
    ],
    connectSrc: [
        'syndication.twitter.com',
        'https://api.github.com/repos/jsdelivr/bootstrapcdn',
        'www.google-analytics.com',
        'https://analytics.google.com',
        'https://stats.g.doubleclick.net'
    ],
    objectSrc: ['img.shields.io'],
    manifestSrc: ['\'self\'']
};

module.exports = CSP;
