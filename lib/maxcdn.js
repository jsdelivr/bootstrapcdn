'use strict';

var path   = require('path');
var store  = require(path.join(__dirname, 'store'));
var cache  = 'popular';
var MaxCDN = require('maxcdn');

function isActive() {
    return !!(process.env.MAXCDN_ALIAS      &&
              process.env.MAXCDN_API_KEY    &&
              process.env.MAXCDN_API_SECRET);
}

var _maxcdn;
function maxcdn() {
    if (!isActive()) return { get: function(cb) { cb(new Error('maxcdn is not configured'), undefined) } };

    _maxcdn = _maxcdn || new MaxCDN(process.env.MAXCDN_ALIAS, process.env.MAXCDN_API_KEY, process.env.MAXCDN_API_SECRET);
    return _maxcdn;
}

function serializer(callback) {
    return function (err, payload) {
        if (err) console.trace(err);

        try {
            callback(JSON.parse(payload));
        } catch(err) {
            callback({});
        }
    };
}

function popularfiles(callback) {
    // currently only fetches from cache on failure
    maxcdn().get('reports/popularfiles.json', function(err, res) {
        if (err) {
            console.trace(err);
            return store.get(cache, serializer(callback));
        }

        console.dir(res.data.popularfiles);

        try {
            store.set(cache, JSON.stringify(res.data.popularfiles), function (err) {
                if (err) console.trace(err);
            });

            callback(res.data.popularfiles);
        } catch(e) {
            return store.get(cache, serializer(callback));
        }
    });
}

module.exports = {
    popularfiles: popularfiles,
    isActive:     isActive
};
