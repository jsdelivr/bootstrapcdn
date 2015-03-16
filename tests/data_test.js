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
var page = format('http://localhost:%s/data/bootstrapcdn.json', process.env.PORT);

var response;
before(function(done) {
    http.get(page, function(res) {
        response = res;
        response.body = '';
        res.on('data', function(chunk) {
            response.body += chunk;
        });
        res.on('end', function() {
            done();
        });
    });
});

describe('data', function() {
    it('/data/bootstrapcdn.json :: 200\'s', function(done) {
        assert(response);
        assert(response.statusCode === 200);
        done();
    });

    it('is json', function(done) {
        assert(JSON.parse(response.body));
        done();
    });
});
