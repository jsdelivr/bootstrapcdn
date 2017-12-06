'use strict';

const path     = require('path');
const assert   = require('assert');

const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'bootlint');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('bootlint', () => {
    const latest = config.bootlint[0];

    describe('config', () => {
        it('is latest', (done) => {
            assert(latest.latest);
            done();
        });

        it('has integrity', (done) => {
            assert(typeof latest.javascriptSri !== 'undefined');
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.response(response);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            response.body.includes(author);
        });
        done();
    });

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center mb-4">Bootlint</h2>');
        done();
    });

    it('has javascript', (done) => {
        response.body.includes(latest.javascript);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

            response.body.includes(str);
            done();
        });
    });
});
