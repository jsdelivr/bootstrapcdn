'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
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
        helpers.assert.response(response);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            response.body.includes(author);
        });
        done();
    });

    it('has notice', (done) => {
        response.body.includes('Bootstrap 4 is currently in Beta release and should be treated as such.');
        done();
    });

    describe('stylesheet', () => {
        it('has uri', (done) => {
            response.body.includes(latest.stylesheet);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

                response.body.includes(str);
                done();
            });
        });
    });

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            response.body.includes(latest.javascript);
            done();
        });

        it('has javascript bundle uri', (done) => {
            response.body.includes(latest.javascriptBundle);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

                response.body.includes(str);
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
        helpers.assert.response(response);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            response.body.includes(author);
        });
        done();
    });

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center">Quick Start</h2>');
        done();
    });

    describe('stylesheet', () => {
        it('has uri', (done) => {
            response.body.includes(latest.stylesheet);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.css[fmt](latest.stylesheet, latest.stylesheetSri);

                response.body.includes(str);
                done();
            });
        });
    });

    describe('javascript', () => {
        it('has javascript uri', (done) => {
            response.body.includes(latest.javascript);
            done();
        });

        ['html', 'pug', 'haml'].forEach((fmt) => {
            it(`has ${fmt}`, (done) => {
                const str = helpers.javascript[fmt](latest.javascript, latest.javascriptSri);

                response.body.includes(str);
                done();
            });
        });
    });
});
