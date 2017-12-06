'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'legacy/bootswatch');

let response = {};

function format(str, name) {
    return str.replace('SWATCH_NAME', name)
                .replace('SWATCH_VERSION', config.bootswatch3.version);
}

before((done) => {
    helpers.preFetch(uri, (res) => {
        response = res;
        done();
    });
});

describe('bootswatch3', () => {
    it('works', (done) => {
        helpers.assert.response(response);
        done();
    });

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center mb-4">Bootswatch 3</h2>');
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            response.body.includes(author);
        });
        done();
    });

    config.bootswatch3.themes.forEach((theme) => {
        const image = format(config.bootswatch3.image, theme.name);
        const uri   = format(config.bootswatch3.bootstrap, theme.name);
        const sri   = theme.sri;

        describe(theme.name, () => {
            describe('config', () => {
                it('has integrity', (done) => {
                    assert(typeof sri !== 'undefined');
                    done();
                });
            });

            it('has image', (done) => {
                response.body.includes(image);
                done();
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has ${fmt}`, (done) => {
                    const str = helpers.css[fmt](uri, sri);

                    response.body.includes(str);
                    done();
                });
            });
        });
    });
});
