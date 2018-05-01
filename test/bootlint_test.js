'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'bootlint');

let response    = {};

describe('bootlint', () => {
    before((done) => {
        helpers.preFetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    const current = config.bootlint[0];

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

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.javascript[fmt](current.javascript, current.javascriptSri);

            assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
            done();
        });
    });
});
