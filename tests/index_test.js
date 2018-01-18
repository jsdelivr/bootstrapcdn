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
    const latest = config.bootstrap4[0];

    describe('config', () => {
        it('is latest', (done) => {
            assert(latest.latest);
            done();
        });

        it('has stylesheet integrity', (done) => {
            assert(typeof latest.stylesheetSri !== 'undefined');
            done();
        });

        it('has javascript integrity', (done) => {
            assert(typeof latest.javascriptSri !== 'undefined');
            done();
        });

        it('has javascript bundle integrity', (done) => {
            assert(typeof latest.javascriptBundleSri !== 'undefined');
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
            assert(response.body.includes(latest.stylesheet),
                `Expects response body to include "${latest.stylesheet}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            assert(response.body.includes(latest.javascript),
                `Expects response body to include "${latest.javascript}"`);
            done();
        });

        it('has javascript bundle uri', (done) => {
            assert(response.body.includes(latest.javascriptBundle),
                `Expects response body to include "${latest.javascriptBundle}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });
});

describe('bootstrap3 block', () => {
    const latest = config.bootstrap3[0];

    describe('config', () => {
        it('is latest', (done) => {
            assert(latest.latest);
            done();
        });

        it('has stylesheet integrity', (done) => {
            assert(typeof latest.stylesheetSri !== 'undefined');
            done();
        });

        it('has javascript integrity', (done) => {
            assert(typeof latest.javascriptSri !== 'undefined');
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
            assert(response.body.includes(latest.stylesheet),
                `Expects response body to include "${latest.stylesheet}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            assert(response.body.includes(latest.javascript),
                `Expects response body to include "${latest.javascript}"`);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

                assert(response.body.includes(str), `Expects response body to include "${str}"`);
                done();
            });
        });
    });
});
