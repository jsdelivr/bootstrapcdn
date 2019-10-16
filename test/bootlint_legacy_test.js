'use strict';

const assert = require('assert').strict;
const { files } = require('../config');
const helpers = require('./test_helpers');

describe('legacy/bootlint', () => {
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

    it('valid html', (done) => {
        helpers.assert.validHTML(response)
            .then(() => done());
    });

    it('contains canonical URL', (done) => {
        helpers.assert.canonicalUrl('/legacy/bootlint/', response, done);
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

    files.bootlint.filter((file) => !file.current)
        .forEach((bootlint) => {
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
