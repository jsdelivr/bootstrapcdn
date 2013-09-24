require('js-yaml');

var http = require('http');
var assert = require('assert');
var format = require('format');

var config = require('../../config/_config.yml');
process.env.PORT = config.port+1; // don't use configured port

/***
 * OAuth Stub
 */
var OAuth = require('oauth').OAuth;
OAuth.prototype.getOAuthRequestToken = function (cb) { cb(); };
OAuth.prototype.getOAuthAccessToken  = function (_, _, cb) { cb(); };
OAuth.prototype.getProtectedResource = function (_, _, _, _, cb) { cb(null, require('../stubs/popular.json'), null); };

var app = require('../../app.js');
var host = format('http://localhost:%s',process.env.PORT);

var response;
before(function(done) {
    http.get(host+'/extras/popular', function(res) {
        response = res;
        response.body = '';
        res.on('data', function(chunk) {
            response.body += chunk;
        });
        res.on('end', function() {
            done();
        });
    });
});

describe('popular', function() {
    it('/extras/popular :: 200\'s', function(done) {
        assert(response);
        assert(200 === response.statusCode);
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

    describe('contains bootswatch', function() {
        config.bootswatch.themes.forEach(function(theme) {
            var file = config.bootswatch.bootstrap
                                .replace('SWATCH_NAME', theme)
                                .replace('SWATCH_VERSION', config.bootstrap.version)
                                .replace('//netdna.bootstrapcdn.com','');
            it(format('-> %s',theme), function(done) {
                assert(
                    response.body.indexOf(file)
                );
                done();
            });
        });
    });

    describe('contains bootstrap', function() {
        config.bootstrap.forEach(function(bootstrap) {
            it(format('-> %s',bootstrap.version), function(done) {
                assert(response.body.indexOf(bootstrap.css_complete.replace('//netdna.bootstrapcdn.com','')));
                assert(response.body.indexOf(bootstrap.javascript.replace('//netdna.bootstrapcdn.com','')));
                if (bootstrap.css_no_icons) {
                    assert(response.body.indexOf(bootstrap.css_no_icons.replace('//netdna.bootstrapcdn.com','')));
                }
                done();
            });
        });
    });
});


