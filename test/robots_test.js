'use strict';

const assert = require('assert').strict;
const helpers = require('./test_helpers.js');

describe('robots.txt', () => {
    const uri = helpers.runApp('robots.txt');
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

    it('has content', (done) => {
        const expected = 'User-agent: *\nDisallow:';

        assert.strictEqual(response.body.trim(), expected, 'Expects response to be valid robots.txt');
        done();
    });
});
