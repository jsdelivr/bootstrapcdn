'use strict';

const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'about');

let response    = {};

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('About', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('About', response, done);
    });
});
