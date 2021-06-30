'use strict';

const helpers = require('./test_helpers');

describe('sitemap.xml', () => {
    const uri = helpers.getURI('sitemap.xml');
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

    after((done) => {
        helpers.stopServer(done);
    });
});
