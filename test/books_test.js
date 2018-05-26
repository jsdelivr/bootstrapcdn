'use strict';

const assert = require('assert').strict;
const htmlEncode = require('htmlencode').htmlEncode;
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
        helpers.assert.pageHeader('Books', response, done);
    });

    config.books.forEach((book) => {
        describe(book.name, () => {
            const beforeTrackImgUrl = `https://ws-na.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${book.asin}&Format=_SL250_&ID=AsinImage&MarketPlace=US&ServiceVersion=20070822&WS=1&tag=bcdn-20`;
            const afterTrackImgUrl = `https://ir-na.amazon-adsystem.com/e/ir?t=bcdn-20&l=li3&o=1&a=${book.asin}`;

            it('has name', (done) => {
                assert.ok(response.body.includes(book.name),
                    `Expects response body to include "${book.name}"`);
                done();
            });

            it('has url', (done) => {
                assert.ok(response.body.includes(htmlEncode(book.url)),
                    `Expects response body to include "${book.url}"`);
                done();
            });

            it('has before tracking image', (done) => {
                assert.ok(response.body.includes(htmlEncode(beforeTrackImgUrl)),
                    `Expects response body to include "${beforeTrackImgUrl}"`);
                done();
            });

            it('has after tracking image', (done) => {
                assert.ok(response.body.includes(htmlEncode(afterTrackImgUrl)),
                    `Expects response body to include "${afterTrackImgUrl}"`);
                done();
            });
        });
    });
});
