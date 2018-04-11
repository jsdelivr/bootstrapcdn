'use strict';

const path    = require('path');
const express = require('express');
const uuidv4  = require('uuid/v4');
const semver  = require('semver');

// constants
const ENV         = process.env;
const NODE_ENV    = ENV.NODE_ENV || 'development';
const PUBLIC_DIR  = path.join(__dirname, 'public');
const STATIC_OPTS = {
    maxAge: '1y',
    lastModified: true,
    etag: false
};

// middleware
const compression  = require('compression');
const favicon      = require('serve-favicon');
const minify       = require('express-minify');
const logger       = require('morgan');
const errorHandler = require('errorhandler');
const enforce      = require('express-sslify');
const sitemap      = require('express-sitemap');
const helmet       = require('helmet');
const Rollbar      = require('rollbar');
const staticify    = require('staticify')(PUBLIC_DIR, {
    sendOptions: STATIC_OPTS
});

const config  = require('./config');
const helpers = require('./lib/helpers.js');
const routes  = require('./routes');

const app     = express();

// all environments
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'pug');
app.set('etag', false);
app.set('json escape', true);
app.set('json spaces', 2);
app.set('x-powered-by', false);

// Enable rollbar early on the middleware stack, if it's configured.
if (ENV.ROLLBAR_ACCESS_TOKEN) {
    const rollbarOptions = {
        accessToken: ENV.ROLLBAR_ACCESS_TOKEN,
        environment: NODE_ENV,
        captureUncaught: true,
        captureUnhandledRejections: true
    };

    // Heroku sets this by default, so using it if present.
    if (ENV.ROLLBAR_ENDPOINT) {
        rollbarOptions.endpoint = ENV.ROLLBAR_ENDPOINT;
    }

    const rollbar = new Rollbar(rollbarOptions);

    app.use(rollbar.errorHandler());
} else if (NODE_ENV !== 'test') {
    console.log('WARNING: starting without rollbar');
}

if (NODE_ENV === 'production') {
    // production
    app.use(logger('combined'));

    if (ENV.FORCE_SSL === 'true') {
        // Because this is (always) going to break local, I'm requiring a secondary
        // environment variable to be enabled to activate it. This is required in
        // app.json to ensure that it's always set when building out the app on
        // Heroku.
        app.use(enforce.HTTPS({ trustProtoHeader: true }));
    }
} else {
    // development
    app.locals.pretty = true;
    app.use(logger('dev'));
    app.use(errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
}

// middleware
app.use(compression());
if (NODE_ENV === 'production') {
    app.use(minify());
}
app.use(staticify.middleware);

app.use(favicon(path.join(PUBLIC_DIR, config.favicon.uri), '7d'));

app.use((req, res, next) => {
    // Create a nonce for use with CSP;
    // get a random UUID and convert it to a base64 string
    const nonce = Buffer.from(uuidv4(), 'utf-8').toString('base64');

    // make config available in routes
    req.config = config;

    // custom headers
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('X-Hello-Human', 'Say hello back! @getBootstrapCDN on Twitter');
    res.setHeader('X-Powered-By', 'StackPath');

    res.locals.nonce = nonce;

    // Don't minify files that are already minified
    if (/\.min(\..{7})?\.(css|js)$/.test(req.url)) {
        res.minifyOptions = res.minifyOptions || {};
        res.minifyOptions.minify = false;
    }

    next();
});

app.use(express.static(PUBLIC_DIR, STATIC_OPTS));

app.use(helmet({
    dnsPrefetchControl: false,
    frameguard: {
        action: 'deny'
    }
}));

app.use(helmet.hsts({
    force: true,
    includeSubdomains: true,
    maxAge: 63072000,   // 2 years
    preload: true
}));

app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

app.use(helmet.contentSecurityPolicy({
    directives: config.CSP,

    // This module will detect common mistakes in your directives and throw errors
    // if it finds any. To disable this, enable "loose mode".
    loose: false,

    // Set to true if you only want browsers to report errors, not block them
    reportOnly: false,

    // Set to true if you want to blindly set all headers: Content-Security-Policy,
    // X-WebKit-CSP, and X-Content-Security-Policy.
    setAllHeaders: false,

    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: false,

    // Set to false if you want to completely disable any user-agent sniffing.
    // This may make the headers less compatible but it will be much faster.
    // This defaults to `true`.
    browserSniff: false
}));

// locals
app.locals.helpers = helpers;
app.locals.config = config;
app.locals.basedir = PUBLIC_DIR;
app.locals.getVersionedPath = staticify.getVersionedPath;
app.locals.semver = semver;

// routes
app.use('/', routes.indexRoute);
app.use('/about/', routes.aboutRoute);
app.use('/alpha/?|/beta/?', routes.redirectToRoot);
app.use('/books/', routes.booksRoute);
app.use('/bootlint/', routes.bootlintRoute);
app.use('/bootswatch/', routes.bootswatchRoute);
app.use('/bootswatch4/', routes.bootswatch4Route);
app.use('/data/bootstrapcdn.json', routes.dataRoute);
app.use('/fontawesome/', routes.fontawesomeRoute);
app.use('/integrations/', routes.integrationsRoute);
app.use('/jobs/', routes.jobsRoute);
app.use('/legacy', routes.legacyRoutes);
app.use('/privacy-policy/', routes.privacyPolicyRoute);
app.use('/showcase/', routes.showcaseRoute);
app.use('/themes/', routes.themesRoute);

const map = sitemap({
    url: 'www.bootstrapcdn.com',
    http: 'https',
    sitemapSubmission: '/sitemap.xml',
    cache: 60000,       // enable 1m cache
    route: {            // custom route
        '/': {
            disallow: !ENV.ENABLE_CRAWLING
        },
        '/data/bootstrapcdn.json': {
            hide: true  // exclude this route from xml and txt
        },
        '/404/': {
            hide: true
        },
        '/alpha/': {
            hide: true
        },
        '/beta/': {
            hide: true
        },
        '/books/': {
            hide: true
        },
        '/bootswatch4/': {
            hide: true
        },
        '/jobs/': {
            hide: true
        },
        '/legacy/': {
            hide: true
        },
        '/sitemap.xml': {
            hide: true
        },
        '/robots.txt': {
            hide: true
        },
        '/themes/': {
            hide: true
        }
    }
});

if (ENV.ENABLE_CRAWLING) {
    app.get('/sitemap.xml', (req, res) => {
        map.generate4(app, [
            '/',
            '/about',
            '/bootlint',
            '/bootswatch',
            '/fontawesome',
            '/integrations',
            '/legacy',
            '/privacy-policy',
            '/showcase'
        ]);
        return map.XMLtoWeb(res);
    });
}

app.get('/robots.txt', (req, res) => map.TXTtoWeb(res));

app.use('*', routes.notFoundRoute);

module.exports = app;

// vim: ft=javascript sw=4 sts=4 et:
