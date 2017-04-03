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
    let latest = config.bootlint[0];

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
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    it('has header', (done) => {
        helpers.assert.contains('<h2>Bootlint</h2>', response.body);
        done();
    });

    it('has javascript', (done) => {
        helpers.assert.contains(latest.javascript, response.body);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it('has ' + fmt, (done) => {
            const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

            helpers.assert.contains(str, response.body);
            done();
        });
    });
});
