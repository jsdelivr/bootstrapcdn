'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'legacy/fontawesome');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('legacy/fontawesome', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Font Awesome Legacy</h2>'),
            'Expects response body to include Font Awesome Legacy header');
        done();
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    config.fontawesome.forEach((fontawesome) => {
        if (fontawesome.current === true) {
            return;
        }

        describe(fontawesome.version, () => {
            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has stylesheet ${fmt}`, (done) => {
                    const str = helpers.css[fmt](fontawesome.stylesheet, fontawesome.stylesheetSri);

                    assert(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });
            });
        });
    });
});
