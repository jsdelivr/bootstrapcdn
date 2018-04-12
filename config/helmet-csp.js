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
        'cdn.carbonads.com',
        'srv.carbonads.net',
        'adn.fusionads.net',
        'fallbacks.carbonads.com',
        'www.ziprecruiter.com',
        'api.ziprecruiter.com',
        (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    styleSrc: [
        '\'self\'',
        '\'unsafe-inline\'',
        'stackpath.bootstrapcdn.com',
        'fonts.googleapis.com',
        '*.twimg.com',
        'platform.twitter.com',
        (req, res) => `'nonce-${res.locals.nonce}'`
    ],
    imgSrc: [
        '\'self\'',
        'data:',
        'www.google-analytics.com',
        'bootswatch.com',
        '*.twitter.com',
        '*.twimg.com',
        'stats.g.doubleclick.net',
        'fallbacks.carbonads.com',
        'srv.carbonads.net',
        'assets.servedby-buysellads.com',
        'ad.doubleclick.net',
        '*.buysellads.net',
        '*.convertro.com',
        '*.c3tag.com',
        '*.2mdn.net',
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
        'syndication.twitter.com'
    ],
    manifestSrc: ['\'self\'']
};

module.exports = CSP;

// vim: ft=javascript sw=4 sts=4 et:
