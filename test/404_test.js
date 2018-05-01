'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, '404');

let response    = {};

describe('404', () => {
    before((done) => {
        helpers.preFetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        assert.strictEqual(response.statusCode, 404);
        done();
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Page Not Found', response, done);
    });
});
