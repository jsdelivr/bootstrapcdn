'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'fontawesome');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('fontawesome', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    const current = config.fontawesome[0];

    it('is current', (done) => {
        assert(current.current);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Font Awesome</h2>'),
            'Expects response body to include Font Awesome header');
        done();
    });

    it('has stylesheet', (done) => {
        assert(response.body.includes(current.stylesheet),
            `Expects response body to include "${current.stylesheet}"`);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.css[fmt](current.stylesheet, current.stylesheetSri);

            assert(response.body.includes(str), `Expects response body to include "${str}"`);
            done();
        });
    });
});
