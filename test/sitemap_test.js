'use strict';

const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'sitemap.xml');

let response    = {};

describe('sitemap.xml', () => {
    before((done) => {
        helpers.preFetch(uri, (res) => {
            response = res;
            done();
        });
    });

    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });
});
