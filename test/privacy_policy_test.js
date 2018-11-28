'use strict';

const helpers = require('./test_helpers.js');

describe('privacy-policy', () => {
    const uri = helpers.getURI('privacy-policy');
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
        helpers.assert.pageHeader('Privacy Policy of www.bootstrapcdn.com', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-privacy-policy', response, done);
    });
});
