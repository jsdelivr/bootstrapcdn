'use strict';

const assert    = require('assert');
const libHelpers = require('../lib/helpers.js');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'data/bootstrapcdn.json');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('data', () => {
    it('/data/bootstrapcdn.json :: 200\'s', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('contains all data', (done) => {
        const expected = libHelpers.generateDataJson();
        const actual = JSON.parse(response.body);

        assert.deepStrictEqual(expected, actual);
        done();
    });
});
