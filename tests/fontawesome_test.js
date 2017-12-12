'use strict';

const assert   = require('assert');
const helpers  = require('./test_helper.js');

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
        assert(response);
        assert.equal(200, response.statusCode);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            assert(response.body.includes(author), `Expected response body to include "${author}"`);
        });
        done();
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Font Awesome</h2>'),
            'Expected response body to include Font Awesome header');
        done();
    });

    it('has stylesheet', (done) => {
        assert(response.body.includes(latest.stylesheet),
            `Expected response body to include "${latest.stylesheet}"`);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

            assert(response.body.includes(str), `Expected response body to include "${str}"`);
            done();
        });
    });
});
