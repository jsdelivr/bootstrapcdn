'use strict';

var path     = require('path');
var assert   = require('assert');

var helpers  = require(path.join(__dirname, 'test_helper.js'));
var config   = helpers.config();
var uri      = helpers.app(config);
var response = {};

before(function (done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('index', function () {
    var latest = config.bootstrap[0];

    describe('config', function () {
        it('is latest', function (done) {
            assert(latest.latest);
            done();
        });

        it('has stylesheet integrity', function (done) {
            assert(typeof latest.stylesheetSri !== 'undefined');
            done();
        });

        it('has javascript integrity', function (done) {
            assert(typeof latest.javascriptSri !== 'undefined');
            done();
        });
    });

    it('works', function (done) {
        helpers.assert.response(response);
        done();
    });

    it('valid html', function (done) {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', function (done) {
        config.authors.forEach(function (author) {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    it('has header', function (done) {
        helpers.assert.contains('<h2>Quick Start</h2>', response.body);
        done();
    });

    describe('stylesheet', function () {
        it('has uri', function (done) {
            helpers.assert.contains(latest.stylesheet, response.body);
            done();
        });

        ['html', 'pug', 'haml'].forEach(function (fmt) {
            it('has ' + fmt, function (done) {
                var str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

                helpers.assert.contains(str, response.body);
                done();
            });
        });
    });

    describe('javascript', function () {
        it('has javascript uri', function (done) {
            helpers.assert.contains(latest.javascript, response.body);
            done();
        });

        ['html', 'pug', 'haml'].forEach(function (fmt) {
            it('has ' + fmt, function (done) {
                var str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

                helpers.assert.contains(str, response.body);
                done();
            });
        });
    });
});
