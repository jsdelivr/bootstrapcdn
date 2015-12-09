'use strict';

var fs      = require('fs');
var path    = require('path');
var assert  = require('assert');
var format  = require('format');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();
var uri     = helpers.app(config, 'popular');

var response;
before(function(done) {
    // default stub
    helpers.maxcdnStubGet(JSON.parse(fs.readFileSync(process.env.CACHE_STORE)), undefined);

    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('popular', function() {
    it('works', function(done) {
        helpers.assert.response(response);
        done();
    });

    it('contains authors', function(done) {
        config.authors.forEach(function(author) {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    it('contains analytics', function(done) {
        helpers.assert.analytics(response, config);
        done();
    });

    it('has header', function (done) {
        helpers.assert.contains('<h1>Popular Files Overview</h1>', response.body);
        done();
    });
});
