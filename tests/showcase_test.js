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
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    it('has header', (done) => {
        helpers.assert.contains('<h2>Showcase</h2>', response.body);
        done();
    });

    config.showcase.forEach((showcase) => {
        describe(showcase.name, () => {
            it('has name', (done) => {
                helpers.assert.contains(showcase.name, response.body);
                done();
            });
            it('has image', (done) => {
                helpers.assert.contains(showcase.img, response.body);
                done();
            });
            it('has lib', (done) => {
                helpers.assert.contains(showcase.lib, response.body);
                done();
            });
            it('has url', (done) => {
                helpers.assert.contains(showcase.url, response.body);
                done();
            });
        });
    });
});
