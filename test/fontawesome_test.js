'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'fontawesome');

let response    = {};

describe('fontawesome', () => {
    before((done) => {
        helpers.preFetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    const current = config.fontawesome[0];

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
        helpers.assert.pageHeader('Font Awesome', response, done);
    });

    it('has stylesheet', (done) => {
        assert.ok(response.body.includes(current.stylesheet),
            `Expects response body to include "${current.stylesheet}"`);
        done();
    });

    ['html', 'pug', 'haml'].forEach((fmt) => {
        it(`has ${fmt}`, (done) => {
            const str = helpers.css[fmt](current.stylesheet, current.stylesheetSri);

            assert.ok(response.body.includes(str), `Expects response body to include "${str}"`);
            done();
        });
    });
});
