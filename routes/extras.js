require('js-yaml');
var MaxCDN  = require('maxcdn');
var commaIt = require('comma-it').commaIt;
var fs      = require('fs');
var maxConf = require('../config/_maxcdn.yml');
var maxcdn  = new MaxCDN(maxConf.alias, maxConf.key, maxConf.secret);
var popSave = "/tmp/.popular.json";

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
        } catch(e) {
            console.trace(e);
        }

        callback(parsed);
        return;
    });
}

function save(file, data) {
    fs.writeFile(file, "utf-8", function (err) {
        if (err) {
            console.trace(err);
        }
        return;
    });
    return;
}

function fetchAndSaveOrLoad(callback) {
    maxcdn.get("reports/popularfiles.json", function (err, res) {
        if (err) {
            console.trace(err);
            load(popSave, function (pop) {
                callback(pop);
                return;
            });
            return;
        }

        if (res && res.data && res.data.popularfiles && res.data.popularfiles.length !== 0) {
            save(popSave, res);
        }

        callback(res.data.popularfiles);
    });
    return;
}

function render(template, req, res, data) {
    var maxSize = 0;
    try {
        maxSize   = data.sort(function(a,b) { return b.size-a.size; })[0].size;
    } catch (e) { }
    res.render(template, {
                    title: 'Bootstrap CDN',
                    theme: req.query.theme,
                    commaIt: commaIt,
                    data: data,
                    maxSize: maxSize,
                });
}

function popular(req, res) {
    if (req.config.stats === "stub") {
        load("../tests/stubs/popular.json", function (data) {
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
