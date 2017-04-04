'use strict';

const path     = require('path');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'integrations');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('integrations', () => {
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
        helpers.assert.contains('<h2>Integrations</h2>', response.body);
        done();
    });

    config.integrations.forEach((integration) => {
        describe(integration.name, () => {
            it('has name', (done) => {
                helpers.assert.contains(integration.name, response.body);
                done();
            });
            it('has image', (done) => {
                helpers.assert.contains(integration.img, response.body);
                done();
            });
            it('has platform', (done) => {
                helpers.assert.contains(integration.plat, response.body);
                done();
            });
            it('has url', (done) => {
                helpers.assert.contains(integration.url, response.body);
                done();
            });
        });
    });
});
