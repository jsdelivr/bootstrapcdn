'use strict';

const assert = require('assert').strict;
const path = require('path');
const semver = require('semver');
const walk = require('fs-walk');
const digest = require('../lib/helpers.js').sri.digest;
const helpers = require('./test_helpers.js');

const config = helpers.getConfig();

const responses = {};

const expectedHeaders = {
    'accept-ranges': 'bytes',
    'access-control-allow-origin': '*',
    'cache-control': 'max-age=31536000',
    'connection': 'Keep-Alive',
    'content-length': '',
    'date': '',
    'etag': '',
    'last-modified': '',
    'vary': 'Accept-Encoding',
    'x-cache': '',
    'x-hello-human': 'Say hello back! @getBootstrapCDN on Twitter'
};

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

const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',

    map: 'application/json; charset=utf-8',

    // images
    png: 'image/png',
    svg: 'image/svg+xml',

    // fonts
    eot: 'application/vnd.ms-fontobject',
    otf: 'application/x-font-otf',
    ttf: 'application/x-font-ttf',
    woff: 'application/font-woff',
    woff2: 'application/font-woff2'
};

// Helper functions used in this file
function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace('https://stackpath.bootstrapcdn.com/', process.env.TEST_S3);
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

    assert.strictEqual(actualSri, expectedSri);
    done();
}

const s3include = ['content-type'];

function assertHeaders(uri) {
    const ext = helpers.getExtension(uri);

    Object.keys(expectedHeaders).forEach((header) => {
        if (typeof process.env.TEST_S3 !== 'undefined' && !s3include.includes(header)) {
            it.skip(`has ${header}`);
        } else {
            it(`has ${header}`, (done) => {
                assert.ok(Object.prototype.hasOwnProperty.call(responses[uri].headers, header),
                    `Expects "${header}" in: ${Object.keys(responses[uri].headers).join(', ')}`);

                // Ignore case in checking equality.
                const actual = responses[uri].headers[header].toLowerCase();

                if (expectedHeaders[header] !== '') {
                    const expected = expectedHeaders[header].toLowerCase();

                    assert.strictEqual(actual, expected);
                }
                done();
            });
        }
    });

    if (compressedExtensions.includes(ext)) {
        it('has content-encoding: gzip', (done) => {
            assert.strictEqual(responses[uri].headers['content-encoding'], 'gzip');
            done();
        });
    } else {
        it('does NOT have content-encoding set', (done) => {
            // eslint-disable-next-line no-undefined
            assert.strictEqual(responses[uri].headers['content-encoding'], undefined);
            done();
        });
    }
}

function assertContentType(uri, currentType, cb) {
    const ext = helpers.getExtension(uri);
    const expectedType = CONTENT_TYPE_MAP[ext];

    assert.strictEqual(currentType, expectedType,
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
            let root = base.split(`${path.sep}public${path.sep}`)[1];

            // ensure file is in whitelisted directory
            if (typeof root === 'undefined' || !whitelist.includes(root.split(path.sep)[0])) {
                return;
            }

            // replace Windows backslashes with forward ones
            root = root.replace(/\\/g, '/');
            const domain = domainCheck('https://stackpath.bootstrapcdn.com/');
            const uri = `${domain + root}/${name}`;

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
        for (const uri of publicURIs) {
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
            });
        }
    });
});
