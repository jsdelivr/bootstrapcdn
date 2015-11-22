'use strict';

var path    = require('path');
var assert  = require('assert');
var format  = require('format');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();
var uri     = helpers.app(config);

var cssIDs = [
    '#bootswatch',
    '#fontawesome',
    '#quickstart',
    '#madlove',
    '#legacy'
];

var response;
before(function(done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('index', function() {
    var latest = config.bootstrap[0];

    describe('config', function () {
        it('is latest', function (done) {
            assert(latest.latest);
            done();
        });

        it('has stylesheet integrity', function (done) {
            assert(latest.stylesheet_sri !== undefined);
            done();
        });

        it('has javascript integrity', function (done) {
            assert(latest.javascript_sri !== undefined);
            done();
        });
    });

    it('works', function(done) {
        helpers.assertResponse(response);
        done();
    });

    it('contains authors', function(done) {
        config.authors.forEach(function(author) {
            assert(response.body.indexOf(author));
        });
        done();
    });

    it('contains analytics', function(done) {
        assert(response.body.indexOf(config.google_analytics.account_id));
        assert(response.body.indexOf(config.google_analytics.domain_name));
        assert(response.body.indexOf('.google-analytics.com/ga.js'));
        done();
    });

    it('has header', function (done) {
        assert(response.body.indexOf("Quick Start"));
        done();
    });

    describe('stylesheet', function () {
        it('has uri', function (done) {
            assert(response.body.indexOf(latest.stylesheet) > 0, 'expected "' + latest.stylesheet + '"');
            done();
        });

        ['html', 'jade', 'haml'].forEach(function(fmt) {
            it('has ' + fmt, function (done) {
                var str = helpers.css[fmt](latest.stylesheet, latest.stylesheet_sri);
                var pos = response.body.indexOf(str);
                assert(pos > 0, "exected '" + str + "'");
                done();
            });
        });
    });

    describe('javascript', function () {
        it('has javascript uri', function (done) {
            assert(response.body.indexOf(latest.javascript));
            done();
        });

        ['html', 'jade', 'haml'].forEach(function(fmt) {
            it('has ' + fmt, function (done) {
                var str = helpers.javascript[fmt](latest.javascript, latest.javascript_sri);
                var pos = response.body.indexOf(str);
                assert(pos > 0, "exected '" + str + "'");
                done();
            });
        });
    });
});
