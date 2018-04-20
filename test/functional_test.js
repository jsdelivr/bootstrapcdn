/* eslint no-undefined: 0 */

'use strict';

const path      = require('path');
const assert    = require('assert');
const walk      = require('fs-walk');
const semver    = require('semver');
const digest    = require('../lib/helpers.js').sri.digest;
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();

const expectedHeaders = {
    'accept-ranges': 'bytes',
    'access-control-allow-origin': '*',
    'cache-control': 'max-age=31536000',
    'connection': 'Keep-Alive',
    'content-encoding': 'gzip',
    'content-length': undefined,
    'date': undefined,
    'etag': undefined,
    'last-modified': undefined,
    'vary': 'Accept-Encoding',
    'x-cache': undefined,
    'x-hello-human': 'Say hello back! @getBootstrapCDN on Twitter'
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
    });
}

function assertSRI(uri, sri, done) {
    const expected = digest(responses[uri].body, true);

    assert.equal(expected, sri);
    done();
}

const s3include = ['content-type'];

function assertHeaders(uri, header, value) {
    if (typeof process.env.TEST_S3 !== 'undefined' && !s3include.includes(header)) {
        it.skip(`has ${header}`);
    } else {
        it(`has ${header}`, (done) => {
            assert(Object.prototype.hasOwnProperty.call(responses[uri].headers, header),
                `Expects "${header}" in: ${Object.keys(responses[uri].headers).join(', ')}`);

            if (typeof value !== 'undefined') {
                assert.equal(responses[uri].headers[header], value);
            } else if (expectedHeaders[header]) {
                assert.equal(responses[uri].headers[header], expectedHeaders[header]);
            }

            done();
        });
    }
}

describe('functional', () => {
    config.bootstrap.forEach((self) => {
        describe(helpers.domainCheck(self.javascript), () => {
            const uri = helpers.domainCheck(self.javascript);

            it('it works', (done) => {
                request(uri, () => {
                    helpers.assert.itWorks(responses[uri].statusCode, done);
                });
            });

            it('has integrity', (done) => {
                assertSRI(uri, self.javascriptSri, done);
            });
        });

        if (self.javascriptBundle) {
            describe(helpers.domainCheck(self.javascriptBundle), () => {
                const uri = helpers.domainCheck(self.javascriptBundle);

                it('it works', (done) => {
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
                    });
                });

                it('has integrity', (done) => {
                    assertSRI(uri, self.javascriptBundleSri, done);
                });
            });
        }

        describe(helpers.domainCheck(self.stylesheet), () => {
            const uri = helpers.domainCheck(self.stylesheet);

            it('it works', (done) => {
                request(uri, () => {
                    helpers.assert.itWorks(responses[uri].statusCode, done);
                });
            });

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
                it('it works', (done) => {
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
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
            const uri = helpers.domainCheck(config.bootswatch4.bootstrap
                .replace('SWATCH_VERSION', config.bootswatch4.version)
                .replace('SWATCH_NAME', theme.name));

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
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
            const uri = helpers.domainCheck(self.javascript);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
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
            const uri = helpers.domainCheck(self.stylesheet);

            describe(uri, () => {
                it('it works', (done) => {
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
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
            const domain = helpers.domainCheck('https://stackpath.bootstrapcdn.com/');
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
                    request(uri, () => {
                        helpers.assert.itWorks(responses[uri].statusCode, done);
                    });
                });

                Object.keys(expectedHeaders).forEach((header) => {
                    assertHeaders(uri, header);
                });

                it(`has content-type (${uri})`, (done) => {
                    helpers.assert.contentType(uri, responses[uri].headers['content-type'], done);
                });
            });
        }
    });
});
