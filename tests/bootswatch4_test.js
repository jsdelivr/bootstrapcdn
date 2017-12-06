'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
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
        helpers.assert.response(response);
        done();
    });

    it('has header', (done) => {
        response.body.includes('<h2 class="text-center mb-4">Bootswatch 4 Beta</h2>');
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            response.body.includes(author);
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
