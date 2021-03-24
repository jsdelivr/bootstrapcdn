'use strict';

const assert = require('assert').strict;
const path = require('path');
const semver = require('semver');
const walk = require('fs-walk');
const { generateSri } = require('../lib/helpers');
const { files } = require('../config');
const helpers = require('./test_helpers');

const CDN_URL = 'https://cdn.jsdelivr.net/';

const cache = new Set();
const responses = new Map();

// Expects header names to be lowercase in this object.
const expectedHeaders = {
    'access-control-allow-origin': '*',
    'cache-control': 'public, max-age=31919000',
    'cdn-cache': '',
    'cross-origin-resource-policy': 'cross-origin',
    'date': '',
    'last-modified': '',
    'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
    'timing-allow-origin': '*',
    'vary': 'Accept-Encoding',
    'x-content-type-options': 'nosniff'
};

const compressedExtensions = new Set([
    'css',
    'eot',
    'js',
    'map',
    'otf',
    'svg',
    'ttf'
]);

const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',

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
function request(uri, cb) {
    // return memoized response to avoid making the same http call twice
    if (cache.has(uri)) {
        return cb(responses.get(uri));
    }

    // build memoized response
    return helpers.prefetch(uri, (res) => {
        cache.add(uri);
        responses.set(uri, res);
        cb(res);
    });
}

function assertSRI(uri, actualSri, done) {
    const expectedSri = generateSri(responses.get(uri).body, true);

    assert.equal(actualSri, expectedSri);
    done();
}

function assertHeaders(uri) {
    Object.keys(expectedHeaders).forEach((header) => {
        // Ignore header name case as per the specs
        header = header.toLowerCase();

        const expected = expectedHeaders[header];
        const testDescription = typeof expected === 'undefined' ?
            `does NOT have ${header} present` :
            `has ${header}${expected === '' ? ' present' : `: ${expected}`}`;

        it(testDescription, (done) => {
            const actual = responses.get(uri).headers[header];

            if (typeof expected === 'undefined') {
                assert.equal(actual, expected, `Expects ${header} to NOT be present in the response headers`);
            } else if (expected === '') {
                assert.ok(Object.prototype.hasOwnProperty.call(responses.get(uri).headers, header),
                    `Expects "${header}" to be present in the response headers`);
            } else {
                assert.equal(actual, expected, `Expects ${header} to be present in the response headers`);
            }

            done();
        });
    });

    const ext = helpers.getExtension(uri);
    if (compressedExtensions.has(ext)) {
        it('has content-encoding: gzip', (done) => {
            assert.equal(responses.get(uri).headers['content-encoding'], 'gzip');
            done();
        });
    } else {
        it('does NOT have content-encoding set', (done) => {
            assert.equal(responses.get(uri).headers['content-encoding'], undefined);
            done();
        });
    }
}

function assertContentType(uri, currentType, cb) {
    const ext = helpers.getExtension(uri);
    const expectedType = CONTENT_TYPE_MAP[ext];

    assert.equal(currentType, expectedType, `Invalid "content-type" for "${ext}", expects "${expectedType}" but got "${currentType}"`);
    cb();
}

describe('functional', () => {
    files.bootstrap.forEach((self) => {
        describe(self.javascript, () => {
            const uri = self.javascript;

            it('it works', (done) => {
                request(uri, (res) => {
                    helpers.assert.itWorks(res.statusCode, done);
                });
            });

            it('has integrity', (done) => {
                assertSRI(uri, self.javascriptSri, done);
            });
        });

        if (self.javascriptBundle) {
            describe(self.javascriptBundle, () => {
                const uri = self.javascriptBundle;

                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptBundleSri, done);
                });
            });
        }

        describe(self.stylesheet, () => {
            const uri = self.stylesheet;

            it('it works', (done) => {
                request(uri, (res) => {
                    helpers.assert.itWorks(res.statusCode, done);
                });
            });

            it('has integrity', (done) => {
                assertSRI(uri, self.stylesheetSri, done);
            });
        });
    });

    describe('bootswatch3', () => {
        files.bootswatch3.themes.forEach((theme) => {
            const uri = files.bootswatch3.bootstrap
                .replace('SWATCH_VERSION', files.bootswatch3.version)
                .replace('SWATCH_NAME', theme.name);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootswatch4', () => {
        files.bootswatch4.themes.forEach((theme) => {
            const uri = files.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', files.bootswatch4.version)
                .replace('SWATCH_NAME', theme.name);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, theme.sri, done);
                });
            });
        });
    });

    describe('bootlint', () => {
        files.bootlint.forEach((self) => {
            const uri = self.javascript;

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptSri, done);
                });
            });
        });
    });

    describe('fontawesome', () => {
        files.fontawesome.forEach((self) => {
            const uri = self.stylesheet;

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, (res) => {
                        helpers.assert.itWorks(res.statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.stylesheetSri, done);
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
            const uri = `${CDN_URL + root}/${name}`;

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
                    assertContentType(uri, responses.get(uri).headers['content-type'], done);
                });
            });
        }
    });
});
