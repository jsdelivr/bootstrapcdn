'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'legacy/bootstrap');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('legacy/bootstrap', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Bootstrap Legacy</h2>'),
            'Expects response body to include Bootstrap Legacy header');
        done();
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    config.bootstrap.forEach((bootstrap) => {
        if (bootstrap.current === true) {
            return;
        }

        describe(bootstrap.version, () => {
            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has javascript ${fmt}`, (done) => {
                    const str = helpers.javascript[fmt](bootstrap.javascript, bootstrap.javascriptSri);

                    assert(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });

                it(`has stylesheet ${fmt}`, (done) => {
                    const str = helpers.css[fmt](bootstrap.stylesheet, bootstrap.stylesheetSri);

                    assert(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });
            });
        });
    });
});
