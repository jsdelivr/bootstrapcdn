'use strict';

var TITLE = 'Bootstrap CDN by MaxCDN';
function index(req, res) {
    res.render('index', { title: TITLE, theme: req.query.theme });
}

function fontawesome(req, res) {
    res.render('fontawesome', { title: TITLE, theme: req.query.theme });
}

function bootswatch(req, res) {
    res.render('bootswatch', { title: TITLE, theme: req.query.theme });
}

function bootlint(req, res) {
    res.render('bootlint', { title: TITLE, theme: req.query.theme });
}

function legacy(req, res) {
    res.render('legacy', { title: TITLE, theme: req.query.theme });
}

module.exports = {
    index:         index,
    fontawesome:   fontawesome,
    bootswatch:    bootswatch,
    bootlint:      bootlint,
    legacy:        legacy
};

// vim: ft=javascript sw=4 sts=4 et:
