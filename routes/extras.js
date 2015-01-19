'use strict';

var path    = require('path');
var fs      = require('fs');
var os      = require('os');
var yaml    = require('js-yaml');
var MaxCDN  = require('maxcdn');
var config  = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_maxcdn.yml'), 'utf8'));
var maxcdn  = new MaxCDN(config.alias, config.key, config.secret);
var popSave = path.join(os.tmpdir(), '.popular.json');

// grab cached version if fetch fails
function load(file, callback) {
    var parsed = [];
    fs.readFile(file, 'utf-8', function (err, data) {
        if (err) {
            console.trace(err);
            callback(parsed);
            return;
        }

        try {
            parsed = JSON.parse(data).data.popularfiles;
            console.log('Popular Files loaded from ', file);
        } catch(e) {
            console.trace(e);
        }

        callback(parsed);
        return;
    });
}

function save(file) {
    fs.writeFile(file, 'utf-8', function (err) {
        if (err) {
            console.trace(err);
        } else {
            console.log('Popular Files saved to', file);
        }
        return;
    });
    return;
}

function fetchAndSaveOrLoad(callback) {
    maxcdn.get('reports/popularfiles.json', function (err, res) {
        if (err) {
            console.trace(err);
            load(popSave, function (pop) {
                callback(pop);
                return;
            });
            return;
        }

        if (res && res.data && res.data.popularfiles && res.data.popularfiles.length !== 0) {
            save(popSave);
        }

        callback(res.data.popularfiles);
    });
    return;
}

function render(template, req, res, data) {
    var maxSize = 0;
    try {
        maxSize = data.sort(function(a, b) {
                                return b.size - a.size;
                            })[0].size;
    } catch (e) { }
    res.render(template, {
                    title: 'Bootstrap CDN',
                    theme: req.query.theme,
                    data: data,
                    maxSize: maxSize
                });
}

function popular(req, res) {
    if (req.config.extras === 'stub') {
        load('tests/stubs/popular.json', function (data) {
            render('extras_popular', req, res, data);
        });
    } else {
        fetchAndSaveOrLoad(function (data) {
            render('extras_popular', req, res, data);
        });
    }
}

function app(req, res) {
    render('extras_app', req, res);
}

function birthday(req, res) {
    res.render('extras_birthday', { title: 'Bootstrap CDN', theme: req.query.theme });
}

module.exports = {
    popular: popular,
    birthday: birthday,
    app: app
};

// vim: ft=javascript sw=4 sts=4 et:
