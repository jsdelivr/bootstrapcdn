require('js-yaml');

var http = require('http');
var assert = require('assert');
var format = require('format');

var config = require('../config/_config.yml');
process.env.PORT = config.port+1; // don't use configured port

var app = require('../app.js');
var page = format('http://localhost:%s/',process.env.PORT);

var tabs = [
    '#bootswatch',
    '#fontawesome',
    '#quickstart',
    '#madlove',
    '#legacy'
];

var response;
before(function(done) {
    http.get(page, function(res) {
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

describe('index', function() {
    it('/ :: 200\'s', function(done) {
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

    describe('contains tabs', function() {
        tabs.forEach(function(tab) {
            it(format('-> %s',tab), function(done) {
                assert(response.body.indexOf(tab));
                done();
            });
        });
    });

    describe('contains bootswatch', function() {
        config.bootswatch.themes.forEach(function(theme) {
            it(format('-> %s',theme), function(done) {
                assert(
                    response.body.indexOf(config.bootswatch.bootstrap
                                            .replace('SWATCH_NAME', theme)
                                            .replace('SWATCH_VERSION', config.bootstrap.version))
                );
                done();
            });
        });
    });

    describe('contains bootstrap', function() {
        config.bootstrap.forEach(function(bootstrap) {
            it(format('-> %s',bootstrap.version), function(done) {
                assert(response.body.indexOf(bootstrap.css_complete));
                assert(response.body.indexOf(bootstrap.javascript));
                if (bootstrap.css_no_icons) {
                    assert(response.body.indexOf(bootstrap.css_no_icons));
                }
                done();
            });
        });
    });
});
