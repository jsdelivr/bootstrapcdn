'use strict';

var path    = require('path');
var assert  = require('assert');
var format  = require('format');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();
var uri     = helpers.app(config, 'integrations');

var response;
before(function(done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('integrations', function() {
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
        helpers.assertContains('<h2>Integrations</h2>', response.body);
        done();
    });

    config.integrations.forEach(function (integration) {
        describe(integration.name, function() {
            it('has name', function(done) {
                helpers.assertContains(integration.name, response.body);
                done();
            });
            it('has image', function(done) {
                helpers.assertContains(integration.img, response.body);
                done();
            });
            it('has platform', function(done) {
                helpers.assertContains(integration.plat, response.body);
                done();
            });
            it('has url', function(done) {
                helpers.assertContains(integration.url, response.body);
                done();
            });
        });
    });

});
