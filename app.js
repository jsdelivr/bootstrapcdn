'use strict';

const path    = require('path');
const express = require('express');
const mime    = require('mime');
const uuidv4  = require('uuid/v4');
const semver  = require('semver');

// constants
const ENV         = process.env;
const NODE_ENV    = ENV.NODE_ENV || 'development';
const PUBLIC_DIR  = path.join(__dirname, 'public');

const customMime  = mime.define({
    'text/javascript': ['js']
}, true);

const STATIC_OPTS = {
    maxAge: '1y',
    lastModified: true,
    etag: false,
    mime: customMime
};

// middleware
const compression  = require('compression');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const errorHandler = require('errorhandler');
const enforce      = require('express-sslify');
const sitemap      = require('express-sitemap');
const helmet       = require('helmet');
const staticify    = require('staticify')(PUBLIC_DIR, {
    sendOptions: STATIC_OPTS
});

const config  = require('./config');
const CSP     = require('./config/helmet-csp');
const helpers = require('./lib/helpers');
const routes  = require('./routes');

const app     = express();

// all environments
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'pug');
app.set('etag', false);
app.set('json escape', true);
app.set('json spaces', 2);
app.set('x-powered-by', false);

/* istanbul ignore if */
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
app.use(staticify.middleware);

app.use(favicon(path.join(PUBLIC_DIR, config.app.favicon.uri), '7d'));

app.use((req, res, next) => {
    // Create a nonce for use with CSP;
    // get a random UUID and convert it to a base64 string
    const nonce = Buffer.from(uuidv4(), 'utf-8').toString('base64');

    // make config available in routes
    req.config = config;

    // custom headers
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('X-Hello-Human', 'Say hello back! @getBootstrapCDN on Twitter');
    res.setHeader('X-Powered-By', 'StackPath');

    res.locals.nonce = nonce;

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
    includeSubDomains: true,
    maxAge: 63072000, // 2 years
    preload: true
}));

app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

app.use(helmet.contentSecurityPolicy({
    directives: CSP,
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
        '/robots.txt': {
            hide: true
        },
        '/sitemap.xml': {
            hide: true
        },
        '/themes/': {
            hide: true
        }
    }
});

/* istanbul ignore if */
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
