require('js-yaml');

var http = require('http');
var assert = require('assert');
var format = require('format');

var config = require('../config/_config.yml');
process.env.PORT = config.port+1; // don't use configured port

var app = require('../app.js');
var host = format('http://localhost:%s',process.env.PORT);

describe('redirects', function() {
    Object.keys(require('../config/_redirects')).forEach(function(requested) {
        it(requested+' :: 301\'s', function(done) {
            http.get(host+requested, function(res) {
                assert(res);
                assert(301 === res.statusCode);
                done();
            });
        });
    });
});

