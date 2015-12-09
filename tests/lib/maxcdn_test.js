'use strict';

var fs      = require('fs');
var path    = require('path');
var assert  = require('assert');
var helpers = require(path.join(__dirname, '..', 'test_helper'));
var store   = require(path.join(__dirname, '..', '..', 'lib', 'store'));
var context = require(path.join(__dirname, '..', '..', 'lib', 'maxcdn'));


describe('maxcdn', function () {
    beforeEach(function (done) {
        process.env.MAXCDN_ALIAS      = 'alias';
        process.env.MAXCDN_API_KEY    = 'apikey';
        process.env.MAXCDN_API_SECRET = 'apisecret';
        done();
    });

    describe('#isActive', function () {
        it('returns false when none are set', function (done) {
            delete process.env.MAXCDN_ALIAS;
            delete process.env.MAXCDN_API_KEY;
            delete process.env.MAXCDN_API_SECRET;

            assert(!context.isActive());
            done();
        });

        it('returns false when one is missing', function (done) {
            delete process.env.MAXCDN_API_SECRET;

            assert(!context.isActive());
            done();
        });

        it('returns true when all are set', function (done) {
            assert(context.isActive());
            done();
        });
    });

    describe('#popularfiles', function () {
        it('works', function (done) {
            helpers.maxcdnStubGet({ data: { popularfiles: { worked: true } } });

            context.popularfiles(function (payload) {
                assert(payload.worked);
                done();
            });
        });

        it('fails over to cache', function(done) {
            helpers.maxcdnStubGet({}, new Error('stubbed error'));

            // stub cache
            var gotten = false;
            store.get = function (_, cb) {
                gotten = true;
                cb({});
            };

            // stub console.trace
            var traced = false;
            console.trace = function () { traced = true; };

            context.popularfiles(function () {
                assert(gotten);
                assert(traced);
                done();
            });
        });
    });
});
