'use strict';

var path     = require('path');
var assert   = require('assert');

var helpers  = require(path.join(__dirname, 'test_helper.js'));
var config   = helpers.config();
var uri      = helpers.app(config, 'legacy');
var response = {};

before(function (done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('legacy', function () {
    it('works', function (done) {
        helpers.assert.response(response);
        done();
    });

    it('has header', function (done) {
        helpers.assert.contains('<h2>Bootstrap Legacy</h2>', response.body);
        done();
    });

    it('contains authors', function (done) {
        config.authors.forEach(function (author) {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    config.bootstrap.forEach(function (bootstrap) {
        if (bootstrap.latest === true) {
            return;
        }

        describe(bootstrap.version, function () {
            describe('config', function () {
                it('has javascript integrity', function (done) {
                    assert(typeof bootstrap.javascriptSri !== 'undefined');
                    done();
                });
                it('has stylesheet integrity', function (done) {
                    assert(typeof bootstrap.stylesheetSri !== 'undefined');
                    done();
                });
            });

            ['html', 'pug', 'haml'].forEach(function (fmt) {
                it('has javascript ' + fmt, function (done) {
                    var str = helpers.javascript[fmt](bootstrap.javascript, bootstrap.javascriptSri);

                    helpers.assert.contains(str, response.body);
                    done();
                });

                it('has stylesheet ' + fmt, function (done) {
                    var str = helpers.css[fmt](bootstrap.stylesheet, bootstrap.stylesheetSri);

                    helpers.assert.contains(str, response.body);
                    done();
                });
            });
        });
    });
});
