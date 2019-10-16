'use strict';

const assert = require('assert').strict;
const { files } = require('../config');
const helpers = require('./test_helpers');

describe('legacy/bootstrap', () => {
    const uri = helpers.getURI('legacy/bootstrap');
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
        helpers.assert.canonicalUrl('/legacy/bootstrap/', response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Bootstrap Legacy', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-legacybootstrap', response, done);
    });

    files.bootstrap.filter((file) => !file.current)
        .forEach((bootstrap) => {
            describe(bootstrap.version, () => {
                ['html', 'pug', 'haml'].forEach((fmt) => {
                    it(`has javascript ${fmt}`, (done) => {
                        const str = helpers.javascript[fmt](bootstrap.javascript, bootstrap.javascriptSri);

                        assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
                        done();
                    });

                    it(`has stylesheet ${fmt}`, (done) => {
                        const str = helpers.css[fmt](bootstrap.stylesheet, bootstrap.stylesheetSri);

                        assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
                        done();
                    });
                });
            });
        });
});
