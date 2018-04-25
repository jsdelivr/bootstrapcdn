'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config);

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('index', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    const current = config.bootstrap[0];

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
        helpers.assert.pageHeader('Quick Start', response, done);
    });

    describe('stylesheet', () => {
        it('has uri', (done) => {
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

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            assert.ok(response.body.includes(current.javascript),
                `Expects response body to include "${current.javascript}"`);
            done();
        });

        it('has javascript bundle uri', (done) => {
            assert.ok(response.body.includes(current.javascriptBundle),
                `Expects response body to include "${current.javascriptBundle}"`);
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
});
