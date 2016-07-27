'use strict';

var path    = require('path');
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
        helpers.assert.contains('<h2>Integrations</h2>', response.body);
        done();
    });

    config.integrations.forEach(function (integration) {
        describe(integration.name, function() {
            it('has name', function(done) {
                helpers.assert.contains(integration.name, response.body);
                done();
            });
            it('has image', function(done) {
                helpers.assert.contains(integration.img, response.body);
                done();
            });
            it('has platform', function(done) {
                helpers.assert.contains(integration.plat, response.body);
                done();
            });
            it('has url', function(done) {
                helpers.assert.contains(integration.url, response.body);
                done();
            });
        });
    });

});
