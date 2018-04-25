'use strict';

const assert     = require('assert');
const path       = require('path');
const staticify  = require('staticify')(path.join(__dirname, '../public'));
const helpers    = require('./test_helpers.js');

const config     = helpers.getConfig();
const uri        = helpers.runApp(config, 'integrations');

let response = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('integrations', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Integrations', response, done);
    });

    config.integrations.forEach((integration) => {
        describe(integration.name, () => {
            it('has name', (done) => {
                assert.ok(response.body.includes(integration.name),
                    `Expects response body to include "${integration.name}"`);
                done();
            });
            it('has image', (done) => {
                assert.ok(response.body.includes(staticify.getVersionedPath(integration.img)),
                    `Expects response body to include "${integration.img}"`);
                done();
            });
            it('has platform', (done) => {
                assert.ok(response.body.includes(integration.plat),
                    `Expects response body to include "${integration.plat}"`);
                done();
            });
            it('has url', (done) => {
                assert.ok(response.body.includes(integration.url),
                    `Expects response body to include "${integration.url}"`);
                done();
            });
        });
    });
});
