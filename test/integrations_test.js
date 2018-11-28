'use strict';

const assert = require('assert').strict;
const path = require('path');
const { htmlEncode } = require('htmlencode');
const staticify = require('staticify')(path.join(__dirname, '../public'));
const helpers = require('./test_helpers.js');

describe('integrations', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('integrations');
    let response = {};

    before((done) => {
        helpers.prefetch(uri, (res) => {
            response = res;
            done();
        });
    });

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

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-integrations', response, done);
    });

    config.integrations.forEach((integration) => {
        describe(integration.name, () => {
            it('has name', (done) => {
                assert.ok(response.body.includes(integration.name),
                    `Expects response body to include "${integration.name}"`);
                done();
            });

            it('has image', (done) => {
                const img = staticify.getVersionedPath(integration.img);

                assert.ok(response.body.includes(img),
                    `Expects response body to include "${img}"`);
                done();
            });

            it('has platform', (done) => {
                assert.ok(response.body.includes(integration.plat),
                    `Expects response body to include "${integration.plat}"`);
                done();
            });

            it('has url', (done) => {
                const url = htmlEncode(integration.url);

                assert.ok(response.body.includes(url),
                    `Expects response body to include "${url}"`);
                done();
            });
        });
    });
});
