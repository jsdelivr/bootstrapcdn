/* eslint no-undefined: 0 */
'use strict';

const path      = require('path');
const assert    = require('assert');
const https     = require('https');
const walk      = require('fs-walk');
const async     = require('async');
const semver    = require('semver');
const digest    = require('../lib/helpers.js').sri.digest;
const helpers   = require('./test_helper.js');

const config    = helpers.config();

const expectedHeaders = {
    'date': undefined,
    'etag': undefined,
    'expires': undefined,

    // connection: 'keep-alive',
    // TODO: research why this is returning 'closed' for
    // this test, but 'keep-alive' as expected via
    // curl and browsers.
    'connection': undefined,

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

const responses = {};

function request(uri, cb) {
    // return memoized response to avoid making the same http call twice
    if (Object.prototype.hasOwnProperty.call(responses, uri)) {
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

function assertHeader(uri, header, value) {
    if (typeof process.env.TEST_S3 !== 'undefined' && !s3include.includes(header)) {
        it.skip(`has ${header}`);
    } else {
        it(`has ${header}`, (done) => {
            request(uri, (response) => {
                assert.equal(200, response.statusCode);
                assert(Object.prototype.hasOwnProperty.call(response.headers, header));

                if (typeof value !== 'undefined') {
                    assert.equal(response.headers[header], value);
                } else if (expectedHeaders[header]) {
                    assert.equal(response.headers[header], expectedHeaders[header]);
                }

                done();
            });
        });
    }
}

describe('functional', () => {
    config.bootstrap.forEach((self) => {
        describe(helpers.domainCheck(self.javascript), () => {
            const uri = helpers.domainCheck(self.javascript);

            Object.keys(expectedHeaders).forEach((header) => {
                assertHeader(uri, header);
            });

            assertHeader(uri, 'content-type', 'application/javascript; charset=utf-8');

            it('has integrity', (done) => {
                assertSRI(uri, self.javascriptSri, done);
            });
        });

        describe(helpers.domainCheck(self.stylesheet), () => {
            const uri = helpers.domainCheck(self.stylesheet);

            Object.keys(expectedHeaders).forEach((header) => {
                assertHeader(uri, header);
            });

            assertHeader(uri, 'content-type', 'text/css; charset=utf-8');

            it('has integrity', (done) => {
                assertSRI(uri, self.stylesheetSri, done);
            });
        });
    });

    describe('bootswatch3', () => {
        config.bootswatch3.themes.forEach((theme) => {
            const uri = helpers.domainCheck(config.bootswatch3.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch3.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                assertHeader(uri, 'content-type', 'text/css; charset=utf-8');

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootswatch4', () => {
        config.bootswatch4.themes.forEach((theme) => {
            const uri = helpers.domainCheck(config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeader(uri, header);
                });

                assertHeader(uri, 'content-type', 'text/css; charset=utf-8');

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

                assertHeader(uri, 'content-type', 'application/javascript; charset=utf-8');

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptSri, done);
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

                assertHeader(uri, 'content-type', 'text/css; charset=utf-8');

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
                });
            });
        });
    });

    describe('public/**/*.*', () => {
        // Build File List
        const whitelist = [
            'bootlint',
            'bootstrap',
            'bootswatch',
            'font-awesome',
            'twitter-bootstrap',
            'css',
            'js'
        ];

        const publicURIs = [];

        walk.filesSync(path.join(__dirname, '..', 'public'), (base, name) => {
            const root = base.split(`${path.sep}public${path.sep}`)[1];

            // ensure file is in whitelisted directory
            if (typeof root === 'undefined' || !whitelist.includes(root.split(path.sep)[0])) {
                return;
            }

            const domain = helpers.domainCheck('https://maxcdn.bootstrapcdn.com/');
            const uri = `${domain + root}/${name}`;
            const ext = helpers.extension(name);

            // ignore unknown / unsupported types
            if (typeof helpers.CONTENT_TYPE_MAP[ext] === 'undefined') {
                return;
            }

            // ignore twitter-bootstrap versions after 2.3.2
            if (uri.includes('twitter-bootstrap')) {
                const m = uri.match(/(\d+\.\d+\.\d+)/);

                // err on the side of testing things that can't be abstracted
                if (m && m[1] && semver.valid(m[1]) && semver.gt(m[1], '2.3.2')) {
                    return; // don't add the file
                }
            }

            publicURIs.push(uri);
        });

        // Run Tests
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
