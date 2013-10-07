var http = require('http');
var assert = require('assert');

// TODO: get two commented out paths to pass tests.
var paths = [
  //'http://s3-us-west-1.amazonaws.com/bootstrap-cdn/public/index.html',
  //'http://s3-us-west-1.amazonaws.com/bootstrap-cdn/public/bootstrap/3.0.0/css/bootstrap.no-icons.min.css',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/js/bootstrap.min.js',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.no-icons.min.css',
  'http://netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
  'http://netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/3.0.0/amelia/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css'
];


// NOTE: headers with 'undefined' as value only check for existence,
// headers with a real value ensure that value.
var expectedHeaders = {
  date: undefined,
  etag: undefined,
  expires: undefined,

  connection: 'keep-alive',
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
var headers;

// test to be run on each expected header
var headerTest = function(head) {
    it('has '+head, function(done) {
        assert(headers.hasOwnProperty(head));

        // for those expectedHeaders with values, verify the value
        if (expectedHeaders[head]) {
            assert(headers[head] === expectedHeaders[head]);
        }
        done();
    });
};

describe('header verification', function() {

    describe('www.bootstrapcdn.com', function() {
        before(function(done) {
            http.get('http://www.bootstrapcdn.com', function(res) {
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
          'x-page-speed'
        ].forEach(headerTest);

    });

    paths.forEach(function(p) {
        describe(p, function() {
            before(function(done) {
                http.get(p, function(res) {
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

            Object.keys(expectedHeaders).forEach(headerTest);
        });
    });
});
