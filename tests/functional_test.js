/* eslint no-undefined: 0 */
'use strict';

const path      = require('path');
const assert    = require('assert');
const walk      = require('fs-walk');
const async     = require('async');
const https     = require('https');
const digest    = require(path.join(__dirname, '..', 'lib', 'helpers')).sri.digest;
const helpers   = require(path.join(__dirname, 'test_helper'));
const config    = helpers.config();

const expectedHeaders = {
    'date': undefined,
    'etag': undefined,
    'expires': undefined,

    // connection: 'keep-alive',
    'connection': undefined, // TODO: reseach why this is returning 'closed' for
                         // this test, but 'keep-alive' as expected via
                         // curl and browsers.

    'vary': 'Accept-Encoding',

    'content-type': undefined,
    'content-length': undefined,

    'last-modified': undefined,
    'x-cache': undefined,

    'accept-ranges': undefined,
    'access-control-allow-origin': '*',

    // the following are set as undefined because www
    // and assets (js/css) differ
    'server': undefined,
    'x-hello-human': undefined,
    'cache-control': undefined
};

let responses = {};

function request(uri, cb) {
    // return memoized response to avoid making the same http call twice
    if (responses.hasOwnProperty(uri)) {
        return cb(responses[uri]);
    }

    // build memoized response
    return helpers.preFetch(uri, (res) => {
        responses[uri] = res;
        cb(res);
    }, https);

}

function assertSRI(uri, sri, done) {
    request(uri, (response) => {
        assert.equal(200, response.statusCode);

        const expected = digest(response.body, true);

        assert.equal(expected, sri);
        done();
    });
}

const s3include = ['content-type'];

function assertHeader(uri, header) {
    if (typeof process.env.TEST_S3 !== 'undefined' && s3include.indexOf(header) === -1) {
        it.skip('has ' + header);
    } else {
        it('has ' + header, (done) => {
            request(uri, (response) => {
                assert.equal(200, response.statusCode);
                assert(response.headers.hasOwnProperty(header));

                if (expectedHeaders[header]) {
                    assert.equal(response.headers[header], expectedHeaders[header]);
                }

                done();
            });
        });
    }
}

describe('functional', () => {
    describe('bootstrap', () => {
        config.bootstrap.forEach((self) => {
            describe(helpers.domainCheck(self.javascript), () => {
                const uri = helpers.domainCheck(self.javascript);

                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptSri, done);
                });
            });

            describe(helpers.domainCheck(self.stylesheet), () => {
                const uri = helpers.domainCheck(self.stylesheet);

                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
                });
            });
        });
    });

    describe('bootswatch', () => {
        config.bootswatch.themes.forEach((theme) => {
            const uri = helpers.domainCheck(config.bootswatch.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootlint', () => {
        config.bootlint.forEach((self) => {
            const uri = helpers.domainCheck(self.javascript);

            describe(uri, () => {
                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptSri, done);
                });
            });
        });
    });

    describe('bootstrap4', () => {
        config.bootstrap4.forEach((self) => {
            describe(helpers.domainCheck(self.javascript), () => {
                const uri = helpers.domainCheck(self.javascript);

                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', function (done) {
                    assertSRI(uri, self.javascriptSri, done);
                });
            });

            describe(helpers.domainCheck(self.stylesheet), () => {
                const uri = helpers.domainCheck(self.stylesheet);

                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
                });
            });
        });
    });

    describe('fontawesome', () => {
        config.fontawesome.forEach((self) => {
            const uri = helpers.domainCheck(self.stylesheet);

            describe(uri, () => {
                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
                });
            });
        });
    });

    describe('public/**/*.*', () => {
        /*
         * Build File List
         ****/
        const whitelist = [
            'bootlint',
            'bootstrap',
            'bootswatch',
            'font-awesome',
            'twitter-bootstrap',
            'css',
            'js'
        ];

        let publicURIs = [];

        walk.filesSync(path.join(__dirname, '..', 'public'), (base, name) => {
            const root = process.platform === 'win32' ? base.split('\\public\\')[1] : base.split('/public/')[1];

            // ensure file is in whitelisted directory
            if (typeof root === 'undefined' || whitelist.indexOf(root.split(path.sep)[0]) === -1) {
                return;
            }

            const domain = helpers.domainCheck('https://maxcdn.bootstrapcdn.com/');
            const uri = domain + root + '/' + name;
            const ext = helpers.extension(name);

            // ignore unknown / unsupported types
            if (typeof helpers.CONTENT_TYPE_MAP[ext] === 'undefined') {
                return;
            }

            publicURIs.push(uri);
        });

        /*
         * Run Tests
         ****/
        async.each(publicURIs, (uri, callback) => {
            describe(uri, () => {
                it('content-type', (done) => {
                    request(uri, (response) => {
                        assert.equal(200, response.statusCode, 'file missing or forbidden');

                        helpers.assert.contentType(uri, response.headers['content-type']);
                        done();
                        callback();
                    });
                });
            });
        });
    });
});
