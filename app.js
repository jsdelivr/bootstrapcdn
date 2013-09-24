// modules
try {
    require('graphdat'); // manually installed, not part of package.json
} catch(e) {
    console.log('[NOTE]: graphdat is not installed, given that it\'s an manually installed module and not part of package.json, we\'re ignoring error and continuing.');
}
require('js-yaml');
var express = require('express');
var connect = require('connect');
var http    = require('http');
var path    = require('path');
var app     = express();

var config  = require(path.join(__dirname, '_config.yml'));

// production
app.configure('production', function(){
  app.use(connect.logger());
});

// development
app.configure('development', function(){
    app.use(connect.logger('dev'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// all environments
app.configure(function() {
    app.set('port', process.env.PORT || config.port || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.disable('x-powered-by');

    // make config availabile in routes
    app.use(function(req,res,next) {
        req.config = config;
        next();
    });

    // locals
    app.locals({ config: config });
    app.locals({ helpers: require('./lib/helpers') });
    app.locals({ tweets: require('./_tweets.yml') });

    // middleware
    app.use(express.favicon(path.join(__dirname, config.favicon.ico)));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});

// routes
app.get('/',              require('./routes').index);
app.get('/stats/popular', require('./routes/stats').popular);
app.get('/birthday',      require('./routes/birthday').birthday);

// redirects
app.get('/stats', function(req,res) {
    res.redirect(301, '/stats/popular');
});
app.get('/stats.html', function(req,res) {
    res.redirect(301, '/stats/popular');
});
app.get('/birthday/1', function(req,res) {
    res.redirect(301, '/birthday');
});

// start
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// vim: ft=javascript sw=4 sts=4 et:
