'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'legacy/fontawesome');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('legacy/fontawesome', () => {
    it('works', (done) => {
        helpers.assert.response(response);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('has header', (done) => {
        helpers.assert.contains('<h2 class="text-center mb-4">Font Awesome Legacy</h2>', response.body);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    config.fontawesome.forEach((fontawesome) => {
        if (fontawesome.latest === true) {
            return;
        }

        describe(fontawesome.version, () => {
            describe('config', () => {
                it('has stylesheet integrity', (done) => {
                    assert(typeof fontawesome.stylesheetSri !== 'undefined');
                    done();
                });
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has stylesheet ${fmt}`, (done) => {
                    const str = helpers.css[fmt](fontawesome.stylesheet, fontawesome.stylesheetSri);

                    helpers.assert.contains(str, response.body);
                    done();
                });
            });
        });
    });
});
