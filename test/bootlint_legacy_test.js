'use strict';

const assert = require('assert').strict;
const helpers = require('./test_helpers.js');

describe('legacy/bootlint', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('legacy/bootlint');
    let response = {};

    before((done) => {
        helpers.prefetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', function(done) {
        this.timeout(helpers.TESTS_TIMEOUT);
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Bootlint Legacy', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-legacybootlint', response, done);
    });

    config.bootlint.forEach((bootlint) => {
        if (bootlint.current === true) {
            return;
        }

        describe(bootlint.version, () => {
            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has javascript ${fmt}`, (done) => {
                    const str = helpers.css[fmt](bootlint.javascript, bootlint.javascriptSri);

                    assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });
            });
        });
    });
});
