var http = require('http');
var assert = require('assert');

// TODO: get two commented out paths to pass tests.
var paths = [
  //Bootstrap
  'http://netdna.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/js/bootstrap.min.js',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/fonts/glyphicons-halflings-regular.woff',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/fonts/glyphicons-halflings-regular.ttf',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/fonts/glyphicons-halflings-regular.svg',
  'http://netdna.bootstrapcdn.com/bootstrap/latest/fonts/glyphicons-halflings-regular.eot',
  //Font Awesome
  'http://netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
  'http://netdna.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css',
  //Bootswatch
  'http://netdna.bootstrapcdn.com/bootswatch/latest/amelia/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/cerulean/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/cosmo/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/cyborg/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/journal/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/readable/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/simplex/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/slate/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/spacelab/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/united/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/flatly/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/yeti/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/darkly/bootstrap.min.css',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/fonts/glyphicons-halflings-regular.woff',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/fonts/glyphicons-halflings-regular.ttf',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/fonts/glyphicons-halflings-regular.svg',
  'http://netdna.bootstrapcdn.com/bootswatch/latest/fonts/glyphicons-halflings-regular.eot'
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
