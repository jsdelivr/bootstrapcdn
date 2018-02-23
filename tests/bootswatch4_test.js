'use strict';

const assert   = require('assert');
const helpers  = require('./test_helper.js');

const config   = helpers.config();
const uri      = helpers.app(config, 'bootswatch');

let response = {};

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
        assert(response);
        assert.equal(200, response.statusCode);
        done();
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
        config.authors.forEach((author) => {
            assert(response.body.includes(author), `Expects response body to include "${author}"`);
        });
        done();
    });

    config.bootswatch4.themes.forEach((theme) => {
        const image = format(config.bootswatch4.image, theme.name);
        const uri   = format(config.bootswatch4.bootstrap, theme.name);
        const sri   = theme.sri;

        describe(theme.name, () => {
            describe('config', () => {
                it('has integrity', (done) => {
                    assert(typeof sri !== 'undefined');
                    done();
                });
            });

            it('has image', (done) => {
                assert(response.body.includes(image),
                    `Expects response body to include "${image}"`);
                done();
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has ${fmt}`, (done) => {
                    const str = helpers.css[fmt](uri, sri);

                    assert(response.body.includes(str), `Expects response body to include "${str}"`);
                    done();
                });
            });
        });
    });
});
