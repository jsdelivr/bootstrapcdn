'use strict';

var fs      = require('fs');
var os      = require('os');
var path    = require('path');
var redis   = require('redis');
var assert  = require('assert');
var helpers = require(path.join(__dirname, '..', 'test_helper'));
var context = require(path.join(__dirname, '..', '..', 'lib', 'store'));
//var maxcdn  = require(path.join(__dirname, '..', '..', 'lib', 'maxcdn'));

describe('store', function () {
    beforeEach(function (done) {
        delete process.env.CACHE_STORE;
        done();
    });

    describe('#store', function () {
        it('uses CACHE_STORE when set', function (done) {
            process.env.CACHE_STORE = '/foo/bar.txt';
            assert.equal('/foo/bar.txt', context.store('ignored-key'));
            done();
        });

        it('builds store path with key', function (done) {
            assert.equal(os.tmpdir() + '/.key.json', context.store('key'));
            done();
        });
    });

    describe('#get', function () {
        it('works w/o redis', function (done) {
            var read;
            fs.readFile = function (key, cb) {
                read = true;
                cb();
            };

            context.get('foobar', function() {
                assert(read);
                done();
            });
        });

        it.skip('works w/ redis', function (done) {
            done();
        });
    });

    describe('#set', function () {
        it('works w/o redis', function (done) {
            var wrote;
            fs.writeFile = function (key, data, cb) {
                wrote = true;
                cb();
            };

            context.set('foobar', 'foobar', function() {
                assert(wrote);
                done();
            });
        });

        it.skip('works w/ redis', function (done) {
            done();
        });
    });
});
