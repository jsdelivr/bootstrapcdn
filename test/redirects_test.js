'use strict';

const assert = require('assert').strict;
const helpers = require('./test_helpers.js');

describe('redirects', () => {
    const config = helpers.getConfig();
    const { redirects } = config;

    for (const redirect in redirects) {
        if (Object.prototype.hasOwnProperty.call(redirects, redirect)) {
            const redirectFrom = redirects[redirect].from;
            const redirectTo = redirects[redirect].to;
            let uri = '';
            let response = {};

            before((done) => {
                uri = helpers.getURI(redirectFrom);

                helpers.prefetch(uri, (res) => {
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
