'use strict';

var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var http   = require('http');
var assert = require('assert');
var format = require('format');

var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_config.yml'), 'utf8'));
process.env.PORT = (config.port < 3000 ? config.port + 3000 : config.port + 1); // don't use configured port

require('../app.js');
var host      = format('http://localhost:%s', process.env.PORT);
var redirects = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_redirects.yml'), 'utf8'));

describe('redirects', function() {
    Object.keys(redirects).forEach(function(requested) {
        it(requested + ' :: 301\'s', function(done) {
            http.get(host + requested, function(res) {
                assert(res);
                assert(res.statusCode === 301);
                done();
            });
        });
    });
});
