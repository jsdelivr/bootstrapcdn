// modules
require('js-yaml');
var express = require('express');
var connect = require('connect');
var main    = require('./routes');
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
});

// locals
app.locals({ helpers: require('./lib/helpers') });
app.locals({ config: config });

// middleware
app.use(express.favicon(path.join(__dirname, config.favicon.ico)));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.get('/', main.index);

// start
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// vim: ft=javascript sw=4 sts=4 et:
