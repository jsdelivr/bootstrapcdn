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
            response.body.includes(author);
        });
        done();
    });

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center mb-4">Integrations</h2>');
        done();
    });

    config.integrations.forEach((integration) => {
        describe(integration.name, () => {
            it('has name', (done) => {
                response.body.includes(integration.name);
                done();
            });
            it('has image', (done) => {
                response.body.includes(integration.img);
                done();
            });
            it('has platform', (done) => {
                response.body.includes(integration.plat);
                done();
            });
            it('has url', (done) => {
                response.body.includes(integration.url);
                done();
            });
        });
    });
});
