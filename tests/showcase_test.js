'use strict';

const path     = require('path');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'showcase');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('showcase', () => {
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

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center mb-4">Showcase</h2>');
        done();
    });

    config.showcase.forEach((showcase) => {
        describe(showcase.name, () => {
            it('has name', (done) => {
                response.body.includes(showcase.name);
                done();
            });
            it('has image', (done) => {
                response.body.includes(showcase.img);
                done();
            });
            it('has lib', (done) => {
                response.body.includes(showcase.lib);
                done();
            });
            it('has url', (done) => {
                response.body.includes(showcase.url);
                done();
            });
        });
    });
});
