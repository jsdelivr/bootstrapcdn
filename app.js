'use strict';

// modules
try {
    require('graphdat'); // manually installed, not part of package.json
} catch(e) {
    console.log('[NOTE]: graphdat is not installed, given that it\'s an manually installed module and not part of package.json, we\'re ignoring error and continuing.');
}

var env = process.env.NODE_ENV || 'development';

var path    = require('path');
var fs      = require('fs');
var yaml    = require('js-yaml');
var express = require('express');
var connect = require('connect');
var http    = require('http');
var app     = express();

// middleware
var favicon        = require('serve-favicon');
var logger         = require('morgan');
var serveStatic    = require('serve-static');
var errorHandler   = require('errorhandler');

var config  = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_config.yml'), 'utf8'));
var tweets  = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'config', '_tweets.yml'), 'utf8'));

// production
if (env === 'production') {
  app.use(logger());
}

// development
if (env === 'development') {
    app.use(logger('dev'));
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

// all environments
app.set('port', process.env.PORT || config.port || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.disable('x-powered-by');

// in line middleware actions
app.use(function(req,res,next) {
    // make config availabile in routes
    req.config = config;

    // overwrite default cache-control header
    // drop to 10 minutes
    res.setHeader("Cache-Control", "public, max-age=600");
    next();
});

// middleware
app.use(favicon(path.join(__dirname, 'public' + config.favicon)));
app.use(serveStatic(path.join(__dirname, 'public')));

// locals
app.locals.helpers = require('./lib/helpers');
app.locals.commaIt = require('comma-it');
app.locals.config  = config;
app.locals.tweets  = tweets;

// routes
var extras = require('./routes/extras');
app.get('/',                require('./routes').index);
app.get('/extras/popular',  extras.popular);
app.get('/extras/app',      extras.app);
app.get('/extras/birthday', extras.birthday);

// redirects
var redirects = require('./config/_redirects');
Object.keys(redirects).forEach(function(requested) {
    app.get(requested, function(req, res) { res.redirect(301, redirects[requested]); });
});

// start
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// vim: ft=javascript sw=4 sts=4 et:
