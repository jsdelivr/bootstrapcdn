'use strict';

const path     = require('path');
const assert   = require('assert');
const helpers  = require(path.join(__dirname, 'test_helper.js'));
const config   = helpers.config();
const uri      = helpers.app(config, 'bootswatch4');

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
        helpers.assert.contains('<h2 class="text-center mb-4">Bootswatch 4 Beta</h2>', response.body);
        done();
    });

    it('contains authors', (done) => {
        config.authors.forEach((author) => {
            helpers.assert.contains(author, response.body);
        });
        done();
    });

    config.bootswatch4.themes.forEach((theme) => {
        const name  = theme.name;
        const image = format(config.bootswatch4.image, theme.name);
        const uri   = format(config.bootswatch4.bootstrap, theme.name);
        const sri   = theme.sri;

        describe(name, () => {
            describe('config', () => {
                it('has integrity', (done) => {
                    assert(typeof sri !== 'undefined');
                    done();
                });
            });

            it('has image', (done) => {
                helpers.assert.contains(image, response.body);
                done();
            });

            ['html', 'pug', 'haml'].forEach((fmt) => {
                it(`has ${fmt}`, (done) => {
                    const str = helpers.css[fmt](uri, sri);

                    helpers.assert.contains(str, response.body);
                    done();
                });
            });
        });
    });
});
