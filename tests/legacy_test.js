'use strict';

var path    = require('path');
var assert  = require('assert');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();

function format(str, name) {
    return str.replace("SWATCH_NAME", name)
                .replace("SWATCH_VERSION", config.bootswatch.version);
}

var uri      = helpers.app(config, 'legacy');
var response = {};

before(function(done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('legacy', function () {
    it('works', function (done) {
        helpers.assertResponse(response);
        done();
    });

    it('has header', function (done) {
        helpers.assertContains('<h2>Bootstrap Legacy</h2>', response.body);
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


    config.bootstrap.forEach(function (bootstrap) {
        if (bootstrap.latest === true) return;

        describe(bootstrap.version, function () {
            describe('config', function () {
                it('has javascript integrity', function (done) {
                    assert(bootstrap.javascript_sri !== undefined);
                    done();
                });
                it('has stylesheet integrity', function (done) {
                    assert(bootstrap.stylesheet_sri !== undefined);
                    done();
                });
            });

            ['html', 'jade', 'haml'].forEach(function(fmt) {
                it('has javascript ' + fmt, function (done) {
                    var str = helpers.javascript[fmt](bootstrap.javascript, bootstrap.javascript_sri);
                    helpers.assertContains(str, response.body);
                    done();
                });

                it('has stylesheet ' + fmt, function (done) {
                    var str = helpers.css[fmt](bootstrap.stylesheet, bootstrap.stylesheet_sri);
                    helpers.assertContains(str, response.body);
                    done();
                });
            });
        });
    });
});
