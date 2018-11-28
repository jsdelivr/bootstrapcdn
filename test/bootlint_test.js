'use strict';

const assert = require('assert').strict;
const helpers = require('./test_helpers.js');

describe('bootlint', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('bootlint');
    const current = config.bootlint[0];
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

    it('is current', (done) => {
        assert.ok(current.current);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Bootlint', response, done);
    });

    it('has javascript', (done) => {
        assert.ok(response.body.includes(current.javascript),
            `Expects response body to include "${current.javascript}"`);
        done();
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-bootlint', response, done);
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.javascript[fmt](current.javascript, current.javascriptSri);

            assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
            done();
        });
    });
});
