'use strict';

const assert = require('assert').strict;
const libHelpers = require('../lib/helpers.js');
const helpers = require('./test_helpers.js');

describe('data', () => {
    const uri = helpers.getURI('data/bootstrapcdn.json');
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

    it('contains all data', (done) => {
        const expected = libHelpers.generateDataJson();
        const actual = JSON.parse(response.body);

        assert.deepEqual(actual, expected);
        done();
    });
});
