'use strict';

const assert = require('assert').strict;
const helpers = require('./test_helpers.js');
const config = helpers.getConfig();

function assertJsonResponse(res, expected, done) {
    assert.deepStrictEqual(JSON.parse(res.body), expected);
    if (done) {
        done();
    }
}

function assertBadRequest(res, message = 'Bad Request.', done) {
    assert.strictEqual(res.statusCode, 400);
    assertJsonResponse(res, {
        status: 400,
        message: `${message} Visit ${config.siteurl}/api for documentation.`
    }, done);
}

function assertNotFound(res, message = 'Not found.', done) {
    assert.strictEqual(res.statusCode, 404);
    assertJsonResponse(res, {
        status: 404,
        message: `${message} Visit ${config.siteurl}/api for documentation.`
    }, done);
}

describe('api_v1', () => {
    let uri = null;
    const name = 'bootstrap';
    const data = Object.assign({}, config.api.v1[name]);
    const version = data.tags.latest;
    const assets = data.assets[version];
    const versions = Object.assign({}, data);

    delete versions.assets;

    const invalidUrls = [
        'api/1',
        'api/v1',
        'api/v1/:name/:version/catch-all-route'
    ];

    invalidUrls.forEach((i) => {
        it(`handles invalid URL arguments (${i})`, (done) => {
            uri = helpers.getURI('api/v1');
            helpers.prefetch(uri, (res) => {
                assertBadRequest(res, 'Bad Request.', done);
            });
        });
    });

    it('gives all versions', (done) => {
        uri = helpers.getURI(`api/v1/${name}`);
        helpers.prefetch(uri, (res) => {
            assert.strictEqual(res.statusCode, 200);
            assertJsonResponse(res, versions, done);
        });
    });

    it('gives all assets', (done) => {
        uri = helpers.getURI(`api/v1/${name}/${version}`);
        helpers.prefetch(uri, (res) => {
            assert.strictEqual(res.statusCode, 200);
            assertJsonResponse(res, assets, done);
        });
    });

    it('gives error when version is unknown', (done) => {
        uri = helpers.getURI(`api/v1/${name}/unknown-version`);
        helpers.prefetch(uri, (res) => {
            assertNotFound(res, `Couldn't find version unknown-version for ${name}. Make sure you use a specific version number, and not a version range or a tag.`, done);
        });
    });

    it('gives error when package and version are unknown', (done) => {
        uri = helpers.getURI('api/v1/unknown-name/unknown-version');
        helpers.prefetch(uri, (res) => {
            assertNotFound(res, 'Couldn\'t find unknown-name/unknown-version.', done);
        });
    });

    it('gives error when package is unknown and no version specified (versions)', (done) => {
        uri = helpers.getURI('api/v1/unknown-name');
        helpers.prefetch(uri, (res) => {
            assertNotFound(res, 'Couldn\'t fetch versions for unknown-name.', done);
        });
    });

});
