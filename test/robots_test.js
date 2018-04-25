'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'robots.txt');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('robots.txt', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('has content', (done) => {
        const expected = 'User-agent: *\nDisallow:';

        assert.strictEqual(response.body.trim(), expected.trim(), 'Expects response to be valid robots.txt');
        done();
    });
});
