'use strict';

var path    = require('path');
var assert  = require('assert');
var format  = require('format');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();
var uri     = helpers.app(config, 'showcase');

var response;
before(function(done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('showcase', function() {
    it('works', function(done) {
        helpers.assertResponse(response);
        done();
    });

    it('contains authors', function(done) {
        config.authors.forEach(function(author) {
            helpers.assertContains(author, response.body);
        });
        done();
    });

    it('contains analytics', function(done) {
        helpers.assertAnalytics(response, config);
        done();
    });

    it('has header', function (done) {
        helpers.assertContains('<h2>Showcase</h2>', response.body);
        done();
    });

    config.showcase.forEach(function (showcase) {
        describe(showcase.name, function() {
            it('has name', function(done) {
                helpers.assertContains(showcase.name, response.body);
                done();
            });
            it('has image', function(done) {
                helpers.assertContains(showcase.img, response.body);
                done();
            });
            it('has lib', function(done) {
                helpers.assertContains(showcase.lib, response.body);
                done();
            });
            it('has url', function(done) {
                helpers.assertContains(showcase.url, response.body);
                done();
            });
        });
    });

});
