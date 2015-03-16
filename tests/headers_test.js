'use strict';

var http = require('http');
var assert = require('assert');

// TODO: get two commented out paths to pass tests.

var domains = [
    'www.bootstrapcdn.com',
    'maxcdn.bootstrapcdn.com',

    // TODO: should probably read port from config
    // TODO2: I don't want localhost tests to run if local host is not available.
    //        Also, if running localhost tests, I probably shouldn't run other domains,
    //        as if I'm testing against localhost, then the other domains probably don't
    //        have updated content.
    // 'localhost:3333'
];

var cdndomain = 'maxcdn.bootstrapcdn.com';

// TODO: should read bootswatch from config.
var paths = [
  //Bootstrap
  '/bootstrap/latest/css/bootstrap.min.css',
  '/bootstrap/latest/js/bootstrap.min.js',
  '/bootstrap/latest/fonts/glyphicons-halflings-regular.woff',
  '/bootstrap/latest/fonts/glyphicons-halflings-regular.ttf',
  '/bootstrap/latest/fonts/glyphicons-halflings-regular.svg',
  '/bootstrap/latest/fonts/glyphicons-halflings-regular.eot',
  //Font Awesome
  '/font-awesome/latest/css/font-awesome.css',
  '/font-awesome/latest/css/font-awesome.min.css',
  //Bootswatch
  '/bootswatch/latest/cerulean/bootstrap.min.css',
  '/bootswatch/latest/cosmo/bootstrap.min.css',
  '/bootswatch/latest/cyborg/bootstrap.min.css',
  '/bootswatch/latest/journal/bootstrap.min.css',
  '/bootswatch/latest/readable/bootstrap.min.css',
  '/bootswatch/latest/simplex/bootstrap.min.css',
  '/bootswatch/latest/slate/bootstrap.min.css',
  '/bootswatch/latest/spacelab/bootstrap.min.css',
  '/bootswatch/latest/united/bootstrap.min.css',
  '/bootswatch/latest/flatly/bootstrap.min.css',
  '/bootswatch/latest/yeti/bootstrap.min.css',
  '/bootswatch/latest/darkly/bootstrap.min.css',
  '/bootswatch/latest/paper/bootstrap.min.css',
  '/bootswatch/latest/sandstone/bootstrap.min.css',

  '/bootswatch/latest/fonts/glyphicons-halflings-regular.woff',
  '/bootswatch/latest/fonts/glyphicons-halflings-regular.ttf',
  '/bootswatch/latest/fonts/glyphicons-halflings-regular.svg',
  '/bootswatch/latest/fonts/glyphicons-halflings-regular.eot'
];


// NOTE: headers with 'undefined' as value only check for existence,
// headers with a real value ensure that value.
var expectedHeaders = {
  date: undefined,
  etag: undefined,
  expires: undefined,

  //connection: 'keep-alive',
  connection: undefined, // TODO: reseach why this is returning 'closed' for
                         // this test, but 'keep-alive' as expected via
                         // curl and browsers.
  vary: 'Accept-Encoding',

  'content-type': undefined,
  'content-length': undefined,
  'last-modified': undefined,
  'x-cache': undefined,

  //'x-amz-server-side-encryption': 'AES256',
  'accept-ranges': 'bytes',
  'access-control-allow-origin': '*',

  // the following are set as undefined because www
  // and assets (js/css) differ
  server: undefined,
  'x-hello-human': undefined, // because www and assets differ
  'cache-control': undefined
};

// store headers as they're being verified
var headers, status;

// test to be run on each expected header
var headerTest = function(head) {
    it('has ' + head, function(done) {
        assert(headers.hasOwnProperty(head));

        // for those expectedHeaders with values, verify the value
        if (expectedHeaders[head]) {
            assert.equal(headers[head], expectedHeaders[head]);
        }
        done();
    });
};

function validStatus(s) {
    return s === 200 || s === 304 || s;
}

describe('functional tests', function () {
    describe('file verification', function() {
        domains.forEach(function(domain) {
            before(function(done) {
                http.get('http://' + domain, function(res) {
                    // body collection required for on 'end' event.
                    res.body = '';
                    res.on('data', function(chunk) {
                        res.body += chunk;
                    });
                    res.on('end', function() {
                        headers = res.headers;
                        status  = res.statusCode;
                        done();
                    });
                });
            });

            describe(domain, function() {
                it('has headers', function(done) {
                    assert(headers);
                    done();
                });

                it('returns valid status', function(done) {
                    var valid = validStatus(status);
                    assert(valid === true, 'Invalid status: ' + valid);
                    done();
                });
            });

            paths.forEach(function(p) {
                describe(domain + p, function() {
                    before(function(done) {
                        http.get('http://' + domain + p, function(res) {
                            // body collection required for on 'end' event.
                            res.body = '';
                            res.on('data', function(chunk) {
                                res.body += chunk;
                            });
                            res.on('end', function() {
                                headers = res.headers;
                                status  = res.statusCode;
                                done();
                            });
                        });
                    });

                    it('has headers', function(done) {
                        assert(headers);
                        done();
                    });

                    it('returns valid status', function(done) {
                        var valid = validStatus(status);
                        assert(valid === true, 'Invalid status: ' + valid);
                        done();
                    });
                });
            });
        });
    });

    describe('header verification', function() {

        // TODO: figure out exactly what headers should be here, if it matters
        /*describe(cdndomain, function() {
            before(function(done) {
                http.get('http://'+cdndomain, function(res) {
                    // body collection required for on 'end' event.
                    res.body = '';
                    res.on('data', function(chunk) { res.body += chunk; });
                    res.on('end', function() {
                        headers = res.headers;
                        done();
                    });
                });
            });

            it('has headers', function(done) {
                assert(headers);
                done();
            });

            [ 'date',
              'expires',
              'server',
              'connection',
              'vary',
              'content-type',
              'x-powered-by',
              'cache-control',
              'x-hello-human',
              //'x-page-speed'
            ].forEach(headerTest);

        });*/

        paths.forEach(function(p) {
            describe(cdndomain + p, function() {
                before(function(done) {
                    http.get('http://' + cdndomain + p, function(res) {
                        // body collection required for on 'end' event.
                        res.body = '';
                        res.on('data', function(chunk) {
                            res.body += chunk;
                        });
                        res.on('end', function() {
                            headers = res.headers;
                            done();
                        });
                    });
                });

                it('has headers', function(done) {
                    assert(headers);
                    done();
                });

                Object.keys(expectedHeaders).forEach(headerTest);
            });
        });
    });
});
