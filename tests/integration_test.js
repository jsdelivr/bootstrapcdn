'use strict';

var fs     = require('fs');
var path   = require('path');
var yaml   = require('js-yaml');
var http   = require('https');
var assert = require('assert');
var mktemp = require('mktemp');
var exec   = require('child_process').execSync;
var config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_config.yml'), 'utf8'));

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

var responses = {};
function request(uri, cb) {
    // return memoized response
    if (responses.hasOwnProperty(uri)) return cb(responses[uri]);

    // build memoized response
    responses[uri] = {};
    http.get(uri, function(res) {
        var response = { headers: res.headers };
        var body = '';

        res.on('data', function(chunk) { body += chunk; });
        res.on('end', function() {
            response.body = body;

            // store memoized
            responses[uri] = response;
            cb(response);
        });
    });
}

function assertSRI(uri, sri, done) {
    request(uri, function(response) {
        mktemp.createFile('/tmp/XXXXX.txt', function(err, tmp) {
            if (err) throw err;
            fs.writeFile(tmp, response.body, function(err) {
                if (err) throw err;

                var sri256 = exec('cat '+tmp+' | openssl dgst -sha256 -binary | openssl enc -base64 -A').toString();
                var sri512 = exec('cat '+tmp+' | openssl dgst -sha512 -binary | openssl enc -base64 -A').toString();
                fs.unlinkSync(tmp);

                var expected = 'sha256-'+sri256+' sha512-'+sri512;

                assert.equal(expected, sri);
                done();
            });
        });
    });
}

function assertHeader(uri, expected, done) {
    request(uri, function(response) {
        assert(response.headers.hasOwnProperty(expected));

        if (expectedHeaders[expected]) {
            assert.equal(response.headers[expected], expectedHeaders[expected]);
        }

        done();
    });
}

// bootswtch
describe('integration', function () {
    describe('bootstrap', function () {
        config.bootstrap.forEach(function(self) {
            describe(self.javascript, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.javascript, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.javascript, self.javascript_sri, done);
                });
            });

            describe(self.stylesheet, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.stylesheet, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.stylesheet, self.stylesheet_sri, done);
                });
            });
        });
    });

    describe('bootswatch', function () {
        config.bootswatch.themes.forEach(function(theme) {
            var uri = config.bootswatch.bootstrap
                .replace("SWATCH_VERSION", config.bootswatch.version)
                .replace("SWATCH_NAME", theme.name);

            describe(uri, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(uri, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootlint', function () {
        config.bootlint.forEach(function (self) {
            describe(self.javascript, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.javascript, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.javascript, self.javascript_sri, done);
                });
            });
        });
    });

    describe('bootstrap4', function () {
        config.bootstrap4.forEach(function(self) {
            describe(self.javascript, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.javascript, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.javascript, self.javascript_sri, done);
                });
            });

            describe(self.javascript, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.stylesheet, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.stylesheet, self.stylesheet_sri, done);
                });
            });
        });
    });

    describe('fontawesome', function () {
        config.fontawesome.forEach(function(self) {
            describe(self.stylesheet, function () {
                Object.keys(expectedHeaders).forEach(function(header) {
                    it('has ' + header, function(done) {
                        assertHeader(self.stylesheet, header, done);
                    });
                });

                it('has integrity', function(done) {
                    assertSRI(self.stylesheet, self.stylesheet_sri, done);
                });
            });
        });
    });
});
