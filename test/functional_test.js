/* eslint no-undefined: 0 */

'use strict';

const ENV = process.env;

// We use BCDN_HEADERS to distinguish between production and debug CDN headers
ENV.BCDN_HEADERS = ENV.BCDN_HEADERS || 'production';

const assert = require('assert').strict;
const path = require('path');
const semver = require('semver');
const walk = require('fs-walk');
const { digest } = require('../lib/helpers.js').sri;
const helpers = require('./test_helpers.js');

const config = helpers.getConfig();
const CDN_URL = 'https://stackpath.bootstrapcdn.com/';
const responses = {};

// Expects header names to be lowercase in this object.
const expectedHeaders = {
    'accept-ranges': 'bytes',
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=31536000',
    'connection': 'Keep-Alive',
    'content-length': '',
    'date': '',
    'debug': undefined,
    'etag': '',
    'last-modified': '',
    'timing-allow-origin': '*',
    'vary': 'Accept-Encoding',
    'x-cache': '',
    'x-hello-human': 'Say hello back! @getBootstrapCDN on Twitter',
    'x-hw': undefined
};

if (ENV.BCDN_HEADERS === 'debug') {
    expectedHeaders.debug = 'Enabled';
    // x-cache isn't present when the 'Debug' header is set to 'Enabled'
    expectedHeaders['x-cache'] = undefined;
    expectedHeaders['x-hw'] = '';
}

/*
const compressedExtensions = [
    'css',
    'eot',
    'js',
    'map',
    'otf',
    'svg',
    'ttf',
    'woff',
    'woff2'
];
*/

const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: 'text/javascript; charset=utf-8',

    map: 'application/json; charset=utf-8',

    // images
    png: 'image/png',
    svg: 'image/svg+xml',

    // fonts
    eot: 'application/vnd.ms-fontobject',
    otf: 'font/otf',
    ttf: 'font/ttf',
    woff: 'font/woff',
    woff2: 'font/woff2'
};

// Helper functions used in this file
function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace(CDN_URL, process.env.TEST_S3);
}

function request(uri, cb) {
    // return memoized response to avoid making the same http call twice
    if (Object.prototype.hasOwnProperty.call(responses, uri)) {
        return cb(responses[uri]);
    }

    // build memoized response
    return helpers.prefetch(uri, (res) => {
        responses[uri] = res;
        cb(res);
    });
}

function assertSRI(uri, actualSri, done) {
    const expectedSri = digest(responses[uri].body, true);

    assert.equal(actualSri, expectedSri);
    done();
}

const s3include = ['content-type'];

function assertHeaders(uri) {
    // const ext = helpers.getExtension(uri);

    Object.keys(expectedHeaders).forEach((header) => {
        // Ignore header name case as per the specs
        header = header.toLowerCase();

        if (typeof process.env.TEST_S3 !== 'undefined' && !s3include.includes(header)) {
            it.skip(`has ${header}`);
        } else {
            const expected = expectedHeaders[header];
            const testDescription = typeof expected === 'undefined' ?
                `does NOT have ${header} present` :
                `has ${header}${expected === '' ? ' present' : `: ${expected}`}`;

            it(testDescription, (done) => {
                const actual = responses[uri].headers[header];

                if (typeof expected === 'undefined') {
                    assert.equal(actual, expected, `Expects ${header} to NOT be present in the response headers`);
                } else if (expected === '') {
                    assert.ok(Object.prototype.hasOwnProperty.call(responses[uri].headers, header),
                        `Expects "${header}" to be present in the response headers`);
                } else {
                    assert.equal(actual, expected, `Expects ${header} to be present in the response headers`);
                }

                done();
            });
        }
    });

    /*
    if (compressedExtensions.includes(ext)) {
        it('has content-encoding: gzip', (done) => {
            assert.equal(responses[uri].headers['content-encoding'], 'gzip');
            done();
        });
    } else {
        it('does NOT have content-encoding set', (done) => {
            // eslint-disable-next-line no-undefined
            assert.equal(responses[uri].headers['content-encoding'], undefined);
            done();
        });
    }
    */
}

function assertContentType(uri, currentType, cb) {
    const ext = helpers.getExtension(uri);
    const expectedType = CONTENT_TYPE_MAP[ext];

    assert.equal(currentType, expectedType,
        `Invalid "content-type" for "${ext}", expects "${expectedType}" but got "${currentType}"`);
    cb();
}

describe('functional', () => {
    config.bootstrap.forEach((self) => {
        describe(domainCheck(self.javascript), () => {
            const uri = domainCheck(self.javascript);

            it('it works', (done) => {
                request(uri, (res) => {
                    helpers.assert.itWorks(res.statusCode, done);
                });
            });

            it('has integrity', (done) => {
                assertSRI(uri, self.javascriptSri, done);
            });

            afterEach(function() {
                if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                    const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                    console.error(errStr);
                }
            });
        });

        if (self.javascriptBundle) {
            describe(domainCheck(self.javascriptBundle), () => {
                const uri = domainCheck(self.javascriptBundle);

                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptBundleSri, done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        }

        describe(domainCheck(self.stylesheet), () => {
            const uri = domainCheck(self.stylesheet);

            it('it works', (done) => {
                request(uri, (res) => {
                    helpers.assert.itWorks(res.statusCode, done);
                });
            });

            it('has integrity', (done) => {
                assertSRI(uri, self.stylesheetSri, done);
            });

            afterEach(function() {
                if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                    const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                    console.error(errStr);
                }
            });
        });
    });

    describe('bootswatch3', () => {
        config.bootswatch3.themes.forEach((theme) => {
            const uri = domainCheck(config.bootswatch3.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch3.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        });
    });

    describe('bootswatch4', () => {
        config.bootswatch4.themes.forEach((theme) => {
            const uri = domainCheck(config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        });
    });

    describe('bootlint', () => {
        config.bootlint.forEach((self) => {
            const uri = domainCheck(self.javascript);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptSri, done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        });
    });

    describe('fontawesome', () => {
        config.fontawesome.forEach((self) => {
            const uri = domainCheck(self.stylesheet);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        });
    });

    describe('cdn/**/*.*', () => {
        const cdnURIs = [];

        walk.filesSync(path.join(__dirname, '../cdn'), (base, name) => {
            let root = base.split(`${path.sep}cdn${path.sep}`)[1];

            if (typeof root === 'undefined') {
                return;
            }

            // replace Windows backslashes with forward ones
            root = root.replace(/\\/g, '/');
            const domain = domainCheck(CDN_URL);
            const uri = `${domain + root}/${name}`;

            // ignore twitter-bootstrap versions after 2.3.2
            if (uri.includes('twitter-bootstrap')) {
                const m = uri.match(/(\d+\.\d+\.\d+)/);

                // err on the side of testing things that can't be abstracted
                if (m && m[1] && semver.valid(m[1]) && semver.gt(m[1], '2.3.2')) {
                    return; // don't add the file
                }
            }

            cdnURIs.push(uri);
        });

        // Run Tests
        for (const uri of cdnURIs) {
            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                assertHeaders(uri);

                it('has content-type', (done) => {
                    assertContentType(uri, responses[uri].headers['content-type'], done);
                });

                afterEach(function() {
                    if (this.currentTest.state === 'failed' && ENV.BCDN_HEADERS === 'debug') {
                        const errStr = `\n${uri}\nX-HW: ${responses[uri].headers['x-hw']}`;

                        console.error(errStr);
                    }
                });
            });
        }
    });
});
