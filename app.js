'use strict';

// modules
try {
    require('graphdat'); // manually installed, not part of package.json
} catch(e) {
    console.log('[NOTE]: graphdat is not installed, given that it\'s a manually installed module and not part of package.json, we\'re ignoring error and continuing.');
}

var env = process.env.NODE_ENV || 'development';

var path    = require('path');
var fs      = require('fs');
var yaml    = require('js-yaml');
var express = require('express');
var http    = require('http');
var app     = express();

// middleware
var favicon        = require('serve-favicon');
var logger         = require('morgan');
var serveStatic    = require('serve-static');
var errorHandler   = require('errorhandler');

var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_config.yml'), 'utf8'));
var tweets = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_tweets.yml'), 'utf8'));

// all environments
app.set('port', process.env.PORT || config.port || 3000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.disable('x-powered-by');

// production
if (env === 'production') {
    app.use(logger('combined'));
} else {
    app.locals.pretty = true;
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

// in line middleware actions
app.use(function(req, res, next) {
    // make config available in routes
    req.config = config;
    next();
});

app.use(function(req, res, next) {
    // overwrite default cache-control header
    // drop to 10 minutes
    res.setHeader("Cache-Control", "public, max-age=600");

    // enable bootlint where applicable
    if (req.query.bootlint && req.query.bootlint === 'true') {
        config.bootlint.forEach(function (bootlint) {
            if (bootlint.latest === true) {
                app.locals.bootlint = bootlint.javascript;

                if (env !== 'production') {
                    app.locals.bootlint = app.locals.bootlint.replace('//maxcdn.bootstrapcdn.com', '');
                }

            }
        });
    }

    next();
});

// middleware
app.use(favicon(path.join(__dirname, 'public', config.favicon), '7d'));
app.use(serveStatic(path.join(__dirname, 'public')));

// locals
app.locals.helpers = require('./lib/helpers');
app.locals.commaIt = require('comma-it');
app.locals.config  = config;
app.locals.tweets  = tweets;

// routes
var extras = require('./routes/extras');
var routes = require('./routes');
app.get('/',                routes.index);
app.get('/extras/popular',  extras.popular);
app.get('/extras/app',      extras.app);
app.get('/extras/birthday', extras.birthday);

var data; // only regenerated on restart
app.get('/data/bootstrapcdn.json', function (req, res) {
    data = data || {
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

    res.send(data);
});


// redirects
var redirects = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_redirects.yml'), 'utf8'));
Object.keys(redirects).forEach(function(requested) {
    app.get(requested, function(req, res) { res.redirect(301, redirects[requested]); });
});

// start
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// vim: ft=javascript sw=4 sts=4 et:
