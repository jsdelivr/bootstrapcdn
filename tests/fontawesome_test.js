'use strict';

var path     = require('path');
var assert   = require('assert');

var helpers  = require(path.join(__dirname, 'test_helper.js'));
var config   = helpers.config();
var uri      = helpers.app(config, 'fontawesome');
var response = {};

before(function (done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('fontawesome', function () {
    var latest = config.fontawesome[0];

    describe('config', function () {
        it('is latest', function (done) {
            assert(latest.latest);
            done();
        });

        it('has integrity', function (done) {
            assert(typeof latest.stylesheetSri !== 'undefined');
            done();
        });
    });

    it('works', function (done) {
        helpers.assert.response(response);
        done();
    });

    it('contains authors', function (done) {
        config.authors.forEach(function (author) {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    it('has header', function (done) {
        helpers.assert.contains('<h2>Font Awesome</h2>', response.body);
        done();
    });

    it('has stylesheet', function (done) {
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
