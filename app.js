'use strict';

var env = process.env.NODE_ENV || 'development';

var path    = require('path');
var fs      = require('fs');
var yaml    = require('js-yaml');
var express = require('express');
var http    = require('http');
var app     = express();

// middleware
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var serveStatic  = require('serve-static');
var errorHandler = require('errorhandler');
var enforce      = require('express-sslify');

var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_config.yml'), 'utf8'));
var tweets = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_tweets.yml'), 'utf8'));

// all environments
app.set('port', process.env.PORT || config.port || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

app.disable('x-powered-by');

// production
if (env === 'production') {
    app.use(logger('combined'));
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
} else {
    app.locals.pretty = true;
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

app.use(require('compression')());

app.use(function(req, res, next) {
    // make config available in routes
    req.config = config;

    // custom headers
    res.setHeader('X-Powered-By', 'MaxCDN');
    res.setHeader('X-Hello-Human', 'You must be bored. You should work for us. Email jdorfman+theheader@maxcdn.com or @jdorfman on the twitter.');
    res.setHeader('Cache-Control', 'public, max-age=2592000');

    var oneMonth = 30 * 24 * 60 * 60 * 1000;
    res.setHeader('Expires', new Date(Date.now() + oneMonth).toUTCString());

    // enable bootlint where applicable
    if (req.query.bootlint && req.query.bootlint === 'true') {
        app.locals.bootlint = config.bootlint.filter(function(o) { return o.latest; })[0];
        if (env !== 'production') {
            app.locals.bootlint.javascript = app.locals.bootlint.javascript.replace('https://maxcdn.bootstrapcdn.com', '');
        }
    }

    next();
});

// middleware
app.use(favicon(path.join(__dirname, 'public', config.favicon.uri), '7d'));
app.use(serveStatic(path.join(__dirname, 'public')));

// locals
app.locals.helpers = require('./lib/helpers');
app.locals.commaIt = require('comma-it');
app.locals.config  = config;
app.locals.tweets  = tweets;

// routes
var routes = require('./routes');
app.get('/fontawesome/',  routes.fontawesome);
app.get('/bootswatch/',   routes.bootswatch);
app.get('/bootlint/',     routes.bootlint);
app.get('/alpha/',        routes.alpha);
app.get('/legacy/',       routes.legacy);
app.get('/showcase/',     routes.showcase);
app.get('/integrations/', routes.integrations);
app.get('/',              routes.index);

var data; // only regenerated on restart
app.get('/data/bootstrapcdn.json', function (req, res) {
    if (typeof data === 'undefined') {
        data = {
            timestamp: new Date(),
            bootstrap: {},
            fontawesome: {}
        };

        config.bootstrap.forEach(function(bootstrap) {
            data.bootstrap[bootstrap.version] = {
                css: bootstrap.css_complete,
                js: bootstrap.javascript
            };
        });

        config.fontawesome.forEach(function(fontawesome) {
            data.fontawesome[fontawesome.version] = fontawesome.css_complete;
        });
    }

    res.send(data);
});

// start
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// vim: ft=javascript sw=4 sts=4 et:
