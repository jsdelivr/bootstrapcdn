'use strict';

const CSP = {
    defaultSrc: ['\'none\''],
    baseUri: ['\'self\''],
    formAction: [
        'platform.twitter.com',
        'syndication.twitter.com'
    ],
    frameAncestors: ['\'none\''],
    scriptSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'cdn.jsdelivr.net',
        'www.google-analytics.com',
        'code.jquery.com',
        'platform.twitter.com',
        'api.github.com',
        (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'cdn.jsdelivr.net',
        'fonts.googleapis.com',
        'platform.twitter.com'
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
        'www.launchbit.com'
    ],
    fontSrc: [
        '\'self\'',
        'cdn.jsdelivr.net',
        'fonts.gstatic.com'
    ],
    frameSrc: [
        '\'self\'',
        'img.shields.io',
        'platform.twitter.com',
        'syndication.twitter.com'
    ],
    childSrc: [
        '\'self\'',
        'img.shields.io',
        'platform.twitter.com',
        'syndication.twitter.com'
    ],
    connectSrc: [
        'syndication.twitter.com'
    ],
    objectSrc: [
        'img.shields.io'
    ],
    manifestSrc: ['\'self\'']
};

module.exports = CSP;

// vim: ft=javascript sw=4 sts=4 et:
