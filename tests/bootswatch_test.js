'use strict';

var path     = require('path');
var assert   = require('assert');

var helpers  = require(path.join(__dirname, 'test_helper.js'));
var config   = helpers.config();
var uri      = helpers.app(config, 'bootswatch');
var response = {};

function format(str, name) {
    return str.replace('SWATCH_NAME', name)
                .replace('SWATCH_VERSION', config.bootswatch.version);
}

before(function (done) {
    helpers.preFetch(uri, function (res) {
        response = res;
        done();
    });
});

describe('bootswatch', function () {
    it('works', function (done) {
        helpers.assert.response(response);
        done();
    });

    it('has header', function (done) {
        helpers.assert.contains('<h2>Bootswatch</h2>', response.body);
        done();
    });

    it('contains authors', function (done) {
        config.authors.forEach(function (author) {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    config.bootswatch.themes.forEach(function (theme) {
        var name  = theme.name;
        var image = format(config.bootswatch.image, theme.name);
        var uri   = format(config.bootswatch.bootstrap, theme.name);
        var sri   = theme.sri;

        describe(name, function () {
            describe('config', function () {
                it('has integrity', function (done) {
                    assert(typeof sri !== 'undefined');
                    done();
                });
            });

            it('has image', function (done) {
                helpers.assert.contains(image, response.body);
                done();
            });

            ['html', 'pug', 'haml'].forEach(function (fmt) {
                it('has ' + fmt, function (done) {
                    var str = helpers.css[fmt](uri, sri);

                    helpers.assert.contains(str, response.body);
                    done();
                });
            });
        });
    });
});
