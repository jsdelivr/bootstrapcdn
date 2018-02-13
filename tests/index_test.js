'use strict';

const assert   = require('assert');
const helpers  = require('./test_helper.js');

const config   = helpers.config();
const uri      = helpers.app(config);

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('bootstrap4 block', () => {
    const current = config.bootstrap4[0];

    describe('config', () => {
        it('is current', (done) => {
            assert(current.current);
            done();
        });

        it('has stylesheet integrity', (done) => {
            assert(typeof current.stylesheetSri !== 'undefined');
            done();
        });

        it('has javascript integrity', (done) => {
            assert(typeof current.javascriptSri !== 'undefined');
            done();
        });

        it('has javascript bundle integrity', (done) => {
            assert(typeof current.javascriptBundleSri !== 'undefined');
            done();
        });
    });

    it('works', (done) => {
        assert(response);
        assert.equal(200, response.statusCode);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            assert(response.body.includes(author), `Expects response body to include "${author}"`);
        });
        done();
    });

    describe('stylesheet', () => {
        it('has uri', (done) => {
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

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            assert(response.body.includes(current.javascript),
                `Expects response body to include "${current.javascript}"`);
            done();
        });

        it('has javascript bundle uri', (done) => {
            assert(response.body.includes(current.javascriptBundle),
                `Expects response body to include "${current.javascriptBundle}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](current.javascript, current.javascriptSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });
});

describe('bootstrap3 block', () => {
    const current = config.bootstrap3[0];

    describe('config', () => {
        it('is current', (done) => {
            assert(current.current);
            done();
        });

        it('has stylesheet integrity', (done) => {
            assert(typeof current.stylesheetSri !== 'undefined');
            done();
        });

        it('has javascript integrity', (done) => {
            assert(typeof current.javascriptSri !== 'undefined');
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
            assert(response.body.includes(author),
                `Expects response body to include "${author}"`);
        });
        done();
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center">Quick Start</h2>'),
            'Expects response body to include Quick Start header');
        done();
    });

    describe('stylesheet', () => {
        it('has uri', (done) => {
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

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            assert(response.body.includes(current.javascript),
                `Expects response body to include "${current.javascript}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](current.javascript, current.javascriptSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });
});
