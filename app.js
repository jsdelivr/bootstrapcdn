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

var config  = require(path.join(__dirname, 'config', '_config.yml'));

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

    // in line middleware actions
    app.use(function(req,res,next) {
        // make config availabile in routes
        req.config = config;
        
        // overwrite default cache-control header
        // drop to 10 minutes
        res.setHeader("Cache-Control", "public, max-age=600");
        next();
    });

    // locals
    app.locals({ config: config });
    app.locals({ helpers: require('./lib/helpers') });
    app.locals({ tweets: require('./config/_tweets.yml') });

    // middleware
    app.use(express.favicon(path.join(__dirname, 'public' + config.favicon)));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

});

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
