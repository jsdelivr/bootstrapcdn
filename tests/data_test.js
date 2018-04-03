'use strict';

const http   = require('http');
const assert = require('assert');
const format = require('format');

const helpers = require('./test_helper.js');
const config  = helpers.config();

process.env.PORT = config.port < 3000 ? config.port + 3000 : config.port + 1;   // don't use configured port

require('../app.js');

const page = format('http://localhost:%s/data/bootstrapcdn.json', process.env.PORT);

let response = {};

before((done) => {
    http.get(page, (res) => {
        response = res;
        response.body = '';
        res.on('data', (chunk) => {
            response.body += chunk;
        });
        res.on('end', () => done());
    });
});

describe('data', () => {
    it('/data/bootstrapcdn.json :: 200\'s', (done) => {
        assert(response);
        assert(response.statusCode === 200);
        done();
    });

    it('is json', (done) => {
        assert(JSON.parse(response.body));
        done();
    });
});
