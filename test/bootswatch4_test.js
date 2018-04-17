'use strict';

const assert    = require('assert');
const helpers   = require('./test_helpers.js');

const config    = helpers.getConfig();
const uri       = helpers.runApp(config, 'bootswatch');

let response    = {};

function format(str, name) {
    return str.replace('SWATCH_NAME', name)
                .replace('SWATCH_VERSION', config.bootswatch4.version);
}

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('bootswatch4', () => {
    it('works', (done) => {
        helpers.assert.itWorks(response.statusCode, done);
    });

    it('valid html', (done) => {
        helpers.assert.validHTML(response, done);
    });

    it('has header', (done) => {
        assert(response.body.includes('<h2 class="text-center mb-4">Bootswatch 4</h2>'),
            'Expects response body to include Bootswatch 4 header');
        done();
    });

    it('contains authors', (done) => {
        helpers.assert.authors(response, done);
    });

    config.bootswatch4.themes.forEach((theme) => {
        const themeImage = format(config.bootswatch4.image, theme.name);
        const themeUri   = format(config.bootswatch4.bootstrap, theme.name);
        const themeSri   = theme.sri;

        describe(theme.name, () => {
            it('has image', (done) => {
                assert(response.body.includes(themeImage),
                    `Expects response body to include "${themeImage}"`);
                done();
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has ${fmt}`, (done) => {
                    const str = helpers.css[fmt](themeUri, themeSri);

                    assert(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });
            });
        });
    });
});
