'use strict';

const assert = require('assert').strict;
const path = require('path');
const { htmlEncode } = require('htmlencode');
const staticify = require('staticify')(path.join(__dirname, '../public'));
const helpers = require('./test_helpers.js');

describe('books', () => {
    const config = helpers.getConfig();
    const uri = helpers.getURI('books');
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
        helpers.assert.pageHeader('Bootstrap Books', response, done);
    });

    it('has body class', (done) => {
        helpers.assert.bodyClass('page-books', response, done);
    });

    config.books.forEach((book) => {
        describe(book.name, () => {
            it('has name', (done) => {
                assert.ok(response.body.includes(book.name),
                    `Expects response body to include "${book.name}"`);
                done();
            });

            it('has image', (done) => {
                const img = staticify.getVersionedPath(book.img);

                assert.ok(response.body.includes(img),
                    `Expects response body to include "${img}"`);
                done();
            });

            it('has url', (done) => {
                assert.ok(response.body.includes(htmlEncode(book.url)),
                    `Expects response body to include "${book.url}"`);
                done();
            });
        });
    });
});
