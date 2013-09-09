require('js-yaml');
var OAuth = require('oauth').OAuth;
var commaIt = require('comma-it').commaIt;

var oauth, oa;
try {
    oauth = require('../_oauth.yml').oauth;
    oa    = new OAuth(oauth.request,
                        oauth.access,
                        oauth.key,
                        oauth.secret,
                        '1.0', null, 'HMAC-SHA1');
} catch (e) {
    console.trace(e);
    console.log('ERROR: Copy _oauth.yml.sample to _oauth.yml and update values.');
}

function index(req, res) {
    res.render('index', { title: 'Bootstrap CDN', theme: req.query.theme });
}

function fetchOAuthResource(req, res, callback) {
    if (!oauth || !oa) {
        console.log('[ERROR] OAuth issues!');
        res.send(500);
        callback(false);
    } else {
        oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
            if(error) {
                console.trace(error);
                callback(false);
            } else {
                oa.getOAuthAccessToken(oauth_token, oauth_token_secret, function(error, oauth_access_token, oauth_access_token_secret, results2) {
                    if(error) {
                        console.trace(error);
                        callback(false);
                    } else {
                        var data= "";
                        oa.getProtectedResource(oauth.api, "GET", oauth_access_token, oauth_access_token_secret, function(error, data, response) {
                            callback(data);
                        });
                    }
                });
            }
        });
    }
}

function popular(req, res) {
    var data, maxSize;
    if (req.config.stats !== "stub") {
        data = '';
        if (!oauth || !oa) {
            console.log('[ERROR] OAuth issues!');
            res.send(500);
        } else {
            fetchOAuthResource(req,res,function(data) {
                try {
                    data = data.data.popularfiles;
                    maxSize = data.sort(function(a,b) { return b.size-a.size; })[0].size
                } catch(e) {
                    data = [];
                    maxSize = 0;
                }
                res.render('popular', {
                                title: 'Bootstrap CDN',
                                theme: req.query.theme,
                                commaIt: commaIt,
                                data: data,
                                maxSize: maxSize
                            });
            });
        }
    } else {
        try {
            data = require('../tests/stubs/popular.json').data.popularfiles;
            maxSize = data.sort(function(a,b) { return b.size-a.size; })[0].size
        } catch(e) {
            data = [];
            maxSize = 0;
        }
        res.render('popular', {
                        title: 'Bootstrap CDN',
                        theme: req.query.theme,
                        commaIt: commaIt,
                        data: data,
                        maxSize: maxSize
                    });
    }
}

module.exports = {
    index: index,
    stats: {
        popular: popular
    }
};

// vim: ft=javascript sw=4 sts=4 et:
