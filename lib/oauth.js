var fs    = require('fs');
var OAuth = require('oauth').OAuth;

var config, oa;
try {
    config = require('../_oauth.yml').oauth;
    oauth  = new OAuth(config.request,
                        config.access,
                        config.key,
                        config.secret,
                        '1.0', null, 'HMAC-SHA1');
    oauth.setTimeout(config.timeout);
} catch (e) {
    console.trace(e);
    console.log('[ERROR] Copy _oauth.yml.sample to _oauth.yml and update values.');
}

function fallback(err, file, cb) {
    if (err) { console.trace(err); }
    console.log('[WARNING] Loading oauth data from %s', file);
    fs.readFile(file, 'utf-8', function(err, data) {
        var parsed = [];
        try {
            // TODO: make more versitile for other oauth request.
            parsed = JSON.parse(data).data.popularfiles;
        } catch (e) {}
        cb(parsed);
    });
}

function fetch(fbFile, callback) {
    if (!config || !oauth) {
        console.log('[ERROR] OAuth issues!');
        fallback(null, fbFile, callback);
        return;
    }

    oauth.getOAuthRequestToken(function(error, request_token, request_secret, result){
        if(error) {
            fallback(error, fbFile, callback);
            return;
        }

        oauth.getOAuthAccessToken(request_token, request_secret, function(error, access_token, access_secret, result) {
            var data= "";
            oauth.getProtectedResource(config.api, "GET", access_token, access_secret, function(error, data, response) {
                if(error) {
                    fallback(error, fbFile, callback);
                    return;
                }

                var parsed = [];
                try {
                    // TODO: make more versitile for other oauth request.
                    parsed = JSON.parse(data).data.popularfiles;
                } catch(e) {}
                callback(parsed);
            });
        });
    });
}

module.exports = {
    fetch: fetch,
    fallback: fallback
};

// vim: ft=javascript sw=4 sts=4 et:
