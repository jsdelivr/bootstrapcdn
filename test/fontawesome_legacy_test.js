'use strict';

const assert = require('assert').strict;
const { files } = require('../config');
const helpers = require('./test_helpers');

describe('legacy/fontawesome', () => {
    const uri = helpers.getURI('legacy/fontawesome');
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
        helpers.assert.canonicalUrl('/legacy/fontawesome/', response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Font Awesome Legacy', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-legacyfontawesome', response, done);
    });

    files.fontawesome.filter((file) => !file.current)
        .forEach((fontawesome) => {
            describe(fontawesome.version, () => {
                ['html', 'pug', 'haml'].forEach((fmt) => {
                    it(`has stylesheet ${fmt}`, (done) => {
                        const str = helpers.css[fmt](fontawesome.stylesheet, fontawesome.stylesheetSri);

                        assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
                        done();
                    });
                });
            });
        });
});
