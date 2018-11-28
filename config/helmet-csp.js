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
        'stackpath.bootstrapcdn.com',
        'www.google-analytics.com',
        'code.jquery.com',
        'platform.twitter.com',
        'cdn.syndication.twimg.com',
        'api.github.com',
        'www.ziprecruiter.com',
        'api.ziprecruiter.com',
        'codefund.io',
        (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'stackpath.bootstrapcdn.com',
        'fonts.googleapis.com',
        '*.twimg.com',
        'platform.twitter.com'
    ],
    imgSrc: [
        '\'self\'',
        'data:',
        'www.google-analytics.com',
        'bootswatch.com',
        '*.twitter.com',
        '*.twimg.com',
        'stats.g.doubleclick.net',
        'ad.doubleclick.net',
        '*.convertro.com',
        '*.c3tag.com',
        '*.2mdn.net',
        'codefund.io',
        'cdn.codefund.io',
        'cdn.codefund.app',
        'launchbit.com',
        'www.launchbit.com',
        'www.ziprecruiter.com'
    ],
    fontSrc: [
        '\'self\'',
        'stackpath.bootstrapcdn.com',
        'fonts.gstatic.com'
    ],
    frameSrc: [
        '\'self\'',
        'platform.twitter.com',
        'syndication.twitter.com',
        'ghbtns.com'
    ],
    childSrc: [
        '\'self\'',
        'platform.twitter.com',
        'syndication.twitter.com',
        'ghbtns.com'
    ],
    connectSrc: [
        'syndication.twitter.com',
        'codefund.io'
    ],
    manifestSrc: ['\'self\'']
};

module.exports = CSP;

// vim: ft=javascript sw=4 sts=4 et:
