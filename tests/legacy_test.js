'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'legacy');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('legacy', () => {
    it('works', (done) => {
        helpers.assert.response(response);
        done();
    });

    it('has header', (done) => {
        helpers.assert.contains('<h2>Bootstrap Legacy</h2>', response.body);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    config.bootstrap.forEach((bootstrap) => {
        if (bootstrap.latest === true) {
            return;
        }

        describe(bootstrap.version, () => {
            describe('config', () => {
                it('has javascript integrity', (done) => {
                    assert(typeof bootstrap.javascriptSri !== 'undefined');
                    done();
                });
                it('has stylesheet integrity', (done) => {
                    assert(typeof bootstrap.stylesheetSri !== 'undefined');
                    done();
                });
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it('has javascript ' + fmt, (done) => {
                    const str = helpers.javascript[fmt](bootstrap.javascript, bootstrap.javascriptSri);

                    helpers.assert.contains(str, response.body);
                    done();
                });

                it('has stylesheet ' + fmt, (done) => {
                    const str = helpers.css[fmt](bootstrap.stylesheet, bootstrap.stylesheetSri);

                    helpers.assert.contains(str, response.body);
                    done();
                });
            });
        });
    });
});
