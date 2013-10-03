var http = require('http');
var assert = require('assert');


// TODO: get three commented out paths to pass tests.
var paths = [
  //'http://www.bootstrapcdn.com',
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
  server: 'NetDNA-cache/2.2',
  vary: 'Accept-Encoding',

  'content-type': undefined,
  'content-length': undefined,
  'last-modified': undefined,
  'x-cache': undefined,

  'x-amz-server-side-encryption': 'AES256',
  'accept-ranges': 'bytes',
  'cache-control': 'max-age=604800',
  'access-control-allow-origin': '*',
  'x-hello-human': 'You should work for us! Email: jdorfman+theheader@maxcdn.com or @MaxCDNDeveloper on Twitter'
};

describe('header verification', function() {
    var headers;
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

            Object.keys(expectedHeaders).forEach(function(head) {
                it('has '+head, function(done) {
                    assert(headers.hasOwnProperty(head));

                    // for those expectedHeaders with values, verify the value
                    if (expectedHeaders[head]) {
                        assert(headers[head] === expectedHeaders[head]);
                        done();
                    } else {
                        done();
                    }
                });
            });
        });
    });
});
