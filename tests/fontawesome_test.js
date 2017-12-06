'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'fontawesome');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('fontawesome', () => {
    const latest = config.fontawesome[0];

    describe('config', () => {
        it('is latest', (done) => {
            assert(latest.latest);
            done();
        });

        it('has integrity', (done) => {
            assert(typeof latest.stylesheetSri !== 'undefined');
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
        response.body.includes('<h2 class="text-center mb-4">Font Awesome</h2>');
        done();
    });

    it('has stylesheet', (done) => {
        response.body.includes(latest.stylesheet);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

            response.body.includes(str);
            done();
        });
    });
});
