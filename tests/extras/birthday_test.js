'use strict';

var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var http   = require('http');
var assert = require('assert');
var format = require('format');

var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', '..', 'config', '_config.yml'), 'utf8'));
process.env.PORT = (config.port < 3000 ? config.port + 3000 : config.port + 1); // don't use configured port

require('../../app.js');
var host = format('http://localhost:%s', process.env.PORT);
var response;

before(function(done) {
    http.get(host + '/extras/birthday', function(res) {
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
        assert(response.statusCode === 200);
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
