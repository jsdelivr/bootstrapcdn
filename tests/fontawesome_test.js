'use strict';

var path    = require('path');
var assert  = require('assert');
var helpers = require(path.join(__dirname, 'test_helper.js'));
var config  = helpers.config();

var uri = helpers.app(config) + 'fontawesome';
var response;
before(function(done) {
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
            assert(latest.stylesheet_sri !== undefined);
            done();
        });
    });

    it('works', function (done) {
        helpers.assertResponse(response);
        done();
    });

    it('has header', function (done) {
        assert(response.body.indexOf("Font Awesome"));
        done();
    });

    it('has stylesheet', function (done) {
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
