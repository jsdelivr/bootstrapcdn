'use strict';

const libHelpers = require('../lib/helpers.js');
const helpers = require('./test_helpers.js');

describe('api_v1', () => {
    const endpoint = 'v1';
    const name = 'bootstrap';
    const version = libHelpers.api.latest(name, endpoint);

    let uri = helpers.getURI('api');
    let response = {};

    before((done) => {
        helpers.prefetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
        helpers.assert.validHTML(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('API', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-api', response, done);
    });

    const invalidEndpoints = [
        'api/1',
        `api/${endpoint}`,
        `api/${endpoint}/none/none/extra-path/catch-all-route`,
        `api/${endpoint}/${name}/${version}/extra-path/catch-all-route`
    ];

    invalidEndpoints.forEach((path) => {
        it(`handles invalid endpoints (${path})`, (done) => {
            uri = helpers.getURI(path);
            helpers.prefetch(uri, (res) => {
                const expected = libHelpers.api.badRequest();

                helpers.assert.jsonResponse(expected, res, done);
            });
        });
    });

    it('gives all versions', (done) => {
        uri = helpers.getURI(`api/${endpoint}/${name}`);
        helpers.prefetch(uri, (res) => {
            const tags = libHelpers.api.tags(name, endpoint);
            const versions = libHelpers.api.versions(name, endpoint);
            const expected = {
                tags,
                versions
            };

            helpers.assert.jsonResponse(expected, res, done);
        });
    });

    it('gives all assets', (done) => {
        uri = helpers.getURI(`api/${endpoint}/${name}/${version}`);
        helpers.prefetch(uri, (res) => {
            const data = libHelpers.api.raw(name, endpoint) || {};
            const expected = data[version];

            helpers.assert.jsonResponse(expected, res, done);
        });
    });

    it('gives error when version is unknown', (done) => {
        uri = helpers.getURI(`api/${endpoint}/${name}/none`);
        helpers.prefetch(uri, (res) => {
            const expected = libHelpers.api.notFound(`Couldn't find version none for ${name}. Make sure you use a specific version number, and not a version range or a tag.`);

            helpers.assert.jsonResponse(expected, res, done);
        });
    });

    it('gives error when package and version are unknown', (done) => {
        uri = helpers.getURI(`api/${endpoint}/none/none`);
        helpers.prefetch(uri, (res) => {
            const expected = libHelpers.api.notFound('Couldn\'t find none/none.');

            helpers.assert.jsonResponse(expected, res, done);
        });
    });

    it('gives error when package is unknown and no version specified (versions)', (done) => {
        uri = helpers.getURI(`api/${endpoint}/none`);
        helpers.prefetch(uri, (res) => {
            const expected = libHelpers.api.notFound('Couldn\'t fetch versions for none.');

            helpers.assert.jsonResponse(expected, res, done);
        });
    });

});
