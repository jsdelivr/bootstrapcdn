'use strict';

const assert = require('assert');
const helpers = require('./test_helpers.js');

const config = helpers.getConfig();

describe('redirects', () => {
    const redirects = {
        '/legacy/': '/legacy/bootstrap/',
        '/alpha/': '/',
        '/beta/': '/'
    };

    for (const redirectFrom in redirects) {
        if (Object.prototype.hasOwnProperty.call(redirects, redirectFrom)) {
            const redirectTo = redirects[redirectFrom];
            let uri = '';
            let response = {};

            before((done) => {
                uri = helpers.runApp(config, redirectFrom);

                helpers.preFetch(uri, (res) => {
                    response = res;
                    done();
                });
            });

            it(`"${redirectFrom}" redirects to "${redirectTo}"`, (done) => {
                assert.strictEqual(response.statusCode, 301);
                assert.strictEqual(response.headers.location, redirectTo);
                done();
            });
        }
    }
});
