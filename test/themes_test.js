'use strict';

const assert = require('assert').strict;
const path = require('path');
const { htmlEncode } = require('htmlencode');
const staticify = require('staticify')(path.join(__dirname, '../public'));
const helpers = require('./test_helpers.js');

describe('themes', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('themes');
    let response = {};

    before((done) => {
        helpers.prefetch(uri, (res) => {
            response = res;
            done();
        });
    });

    after((done) => {
        helpers.stopServer(done);
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
        helpers.assert.pageHeader('Bootstrap Themes', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-themes', response, done);
    });

    config.themesAd.forEach((theme) => {
        describe(theme.name, () => {
            it('has name', (done) => {
                assert.ok(response.body.includes(theme.name),
                    `Expects response body to include "${theme.name}"`);
                done();
            });

            it('has image', (done) => {
                const img = staticify.getVersionedPath(theme.img);

                assert.ok(response.body.includes(img),
                    `Expects response body to include "${img}"`);
                done();
            });

            it('has url', (done) => {
                assert.ok(response.body.includes(htmlEncode(theme.url)),
                    `Expects response body to include "${theme.url}"`);
                done();
            });
        });
    });
});
