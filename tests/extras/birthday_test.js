require('js-yaml');

var http = require('http');
var assert = require('assert');
var format = require('format');

var config = require('../../config/_config.yml');
process.env.PORT = config.port+1; // don't use configured port

var app = require('../../app.js');
var host = format('http://localhost:%s',process.env.PORT);

var tabs = [
    '#bootswatch',
    '#fontawesome',
    '#quickstart',
    '#madlove',
    '#legacy'
];

var response;
before(function(done) {
    http.get(host+'/extras/birthday', function(res) {
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

describe('birthday', function() {
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

    it('contains timeline', function(done) {
        assert(response.body.indexOf('http://embed.verite.co/timeline/'));
        done();
    });

    it('contains attribution', function(done) {
        assert(response.body.indexOf('http://timeline.verite.co/'));
        assert(response.body.indexOf('Timeline.JS'));
        done();
    });
});
