'use strict';

const helpers = require('./test_helpers.js');

describe('jobs', () => {
    const uri = helpers.getURI('jobs');
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

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    it('has page header', (done) => {
        helpers.assert.pageHeader('Jobs', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-jobs', response, done);
    });
});
