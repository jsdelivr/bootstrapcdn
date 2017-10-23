'use strict';

const env = process.env.NODE_ENV || 'development';

const path         = require('path');
const fs           = require('fs');
const http         = require('http');
const express      = require('express');
const yaml         = require('js-yaml');
const uuid         = require('uuid');

// middleware
const compression  = require('compression');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const serveStatic  = require('serve-static');
const errorHandler = require('errorhandler');
const enforce      = require('express-sslify');
const sitemap      = require('express-sitemap');
const helmet       = require('helmet');
const Rollbar      = require('rollbar');

const helpers      = require('./lib/helpers');
const routes       = require('./routes');

const config       = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_config.yml'), 'utf8'));
const app          = express();

// all environments
app.set('port', process.env.PORT || config.port || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.disable('x-powered-by');

// Enable rollbar early on the middleware stack, if it's configured.
if (process.env.ROLLBAR_ACCESS_TOKEN) {
    const rollbarOptions = {
        accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
        environment: env,
        captureUncaught: true,
        captureUnhandledRejections: true
    };

    // Heroku sets this by default, so using it if present.
    if (process.env.ROLLBAR_ENDPOINT) {
        rollbarOptions.endpoint = process.env.ROLLBAR_ENDPOINT;
    }

    const rollbar  = new Rollbar(rollbarOptions);

    app.use(rollbar.errorHandler());
} else if (env !== 'test') {
    console.log('WARNING: starting without rollbar');
}

if (env === 'production') {
    // production
    app.use(logger('combined'));

    if (process.env.FORCE_SSL === 'true') {
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
app.set('etag', false);

app.use(favicon(path.join(__dirname, 'public', config.favicon.uri), '7d'));

app.use(serveStatic(path.join(__dirname, 'public'), {
    maxAge: '30d',
    lastModified: true,
    etag: false
}));

app.use((req, res, next) => {
    // make config available in routes
    req.config = config;

    // custom headers
    res.setHeader('X-Powered-By', 'MaxCDN');
    res.setHeader('X-Hello-Human', 'Say hello back! @getBootstrapCDN on Twitter');
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.setHeader('Last-Modified', new Date().toUTCString());
    res.setHeader('Accept-Ranges', 'bytes');

    res.locals.nonce = Buffer.from(uuid.v4(), 'utf-8').toString('base64');

    next();
});

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
    directives: {
        defaultSrc: ['\'none\''],
        baseUri: ['\'self\''],
        frameAncestors: ['\'none\''],
        scriptSrc: [
            '\'self\'',
            '\'unsafe-inline\'',
            'maxcdn.bootstrapcdn.com',
            'www.google-analytics.com',
            'code.jquery.com',
            'platform.twitter.com',
            'cdn.syndication.twimg.com/timeline/',
            'api.github.com',
            'cdn.carbonads.com',
            'srv.carbonads.net',
            'adn.fusionads.net',
            (req, res) => `'nonce-${res.locals.nonce}'`
        ],
        styleSrc: [
            '\'self\'',
            '\'unsafe-inline\'',
            'maxcdn.bootstrapcdn.com',
            'fonts.googleapis.com',
            '*.twimg.com',
            'platform.twitter.com'
        ],
        imgSrc: [
            '\'self\'',
            'data:',
            'www.google-analytics.com',
            'bootswatch.com',
            'syndication.twitter.com',
            '*.twimg.com',
            'platform.twitter.com',
            'analytics.twitter.com',
            'stats.g.doubleclick.net',
            'srv.carbonads.net',
            'assets.servedby-buysellads.com',
            'ad.doubleclick.net',
            '*.convertro.com',
            '*.c3tag.com',
            '*.2mdn.net',
            'launchbit.com',
            'www.launchbit.com'
        ],
        fontSrc: [
            '\'self\'',
            'maxcdn.bootstrapcdn.com',
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
        manifestSrc: ['\'self\''],
        reportUri: 'https://d063bdf998559129f041de1efd2b41a5.report-uri.io/r/default/csp/enforce'
    },

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
    browserSniff: true
}));

// locals
app.locals.helpers = helpers;
app.locals.config = config;
app.locals.basedir = path.join(__dirname, 'public');

// routes
app.get('/fontawesome/', routes.fontawesome);
app.get('/bootswatch/', routes.bootswatch);
app.get('/bootlint/', routes.bootlint);
app.get('/alpha/', routes.alpha);
app.get('/beta/', routes.beta);
app.get('/legacy/', routes.legacy);
app.get('/showcase/', routes.showcase);
app.get('/integrations/', routes.integrations);
app.get('/', routes.index);

let data = {}; // only regenerated on restart

app.get('/data/bootstrapcdn.json', (req, res) => {
    if (typeof data === 'undefined') {
        data = {
            timestamp: new Date(),
            bootstrap: {},
            fontawesome: {}
        };

        config.bootstrap.forEach((bootstrap) => {
            data.bootstrap[bootstrap.version] = {
                css: bootstrap.css_complete,
                js: bootstrap.javascript
            };
        });

        config.fontawesome.forEach((fontawesome) => {
            data.fontawesome[fontawesome.version] = fontawesome.css_complete;
        });
    }

    res.send(data);
});

// Merge in variable options for sitemap.
function sitemapOptions (options) {
    if (env !== 'production') {
        options.route = {
            '/': {
                disallow: true
            }
        };
    }
    return options;
}

const map = sitemap(sitemapOptions({
    url: 'www.bootstrapcdn.com',
    http: 'https',
    generate: app,
    cache: 60000,       // enable 1m cache
    route: {            // custom route
        '/data/bootstrapcdn.json': {
            hide: true  // exclude this route from xml and txt
        }
    }
}));

if (env === 'production') {
    app.get('/sitemap.xml', (req, res) => map.XMLtoWeb(res));
}

app.get('/robots.txt', (req, res) => map.TXTtoWeb(res));

// start
http.createServer(app).listen(app.get('port'), () => console.log(`Express server listening on port ${app.get('port')}`));

// vim: ft=javascript sw=4 sts=4 et:
