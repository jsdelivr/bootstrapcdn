'use strict';

var path     = require('path');

var helpers  = require(path.join(__dirname, 'test_helper.js'));
var config   = helpers.config();
var uri      = helpers.app(config, 'showcase');
var response = {};

before(function (done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('showcase', function () {
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
        helpers.assert.contains('<h2>Showcase</h2>', response.body);
        done();
    });

    config.showcase.forEach(function (showcase) {
        describe(showcase.name, function () {
            it('has name', function (done) {
                helpers.assert.contains(showcase.name, response.body);
                done();
            });
            it('has image', function (done) {
                helpers.assert.contains(showcase.img, response.body);
                done();
            });
            it('has lib', function (done) {
                helpers.assert.contains(showcase.lib, response.body);
                done();
            });
            it('has url', function (done) {
                helpers.assert.contains(showcase.url, response.body);
                done();
            });
        });
    });
});
