'use strict';

var TITLE = 'BootstrapCDN by MaxCDN';
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

function alpha(req, res) {
    res.render('alpha', { title: TITLE, theme: req.query.theme });
}

function legacy(req, res) {
    res.render('legacy', { title: TITLE, theme: req.query.theme });
}

function showcase(req, res) {
    var showcase = req.config.showcase;
    var col1 = [];
    var col2 = [];

    for (var i = 0; i < showcase.length; i++) {
        if (i % 2 === 0) {
            col1.push(showcase[i]);
        } else {
            col2.push(showcase[i]);
        }
    }

    res.render('showcase', { title: TITLE, theme: req.query.theme, col1: col1, col2: col2 })
}

function integrations(req, res) {
    var integrations = req.config.integrations;
    var col1 = [];
    var col2 = [];

    for (var i = 0; i < integrations.length; i++) {
        if (i % 2 === 0) {
            col1.push(integrations[i]);
        } else {
            col2.push(integrations[i]);
        }
    }

    res.render('integrations', { title: TITLE, theme: req.query.theme, col1: col1, col2: col2 })
}

module.exports = {
    index:         index,
    fontawesome:   fontawesome,
    bootswatch:    bootswatch,
    bootlint:      bootlint,
    alpha:         alpha,
    legacy:        legacy,
    showcase:      showcase,
    integrations:  integrations
};

// vim: ft=javascript sw=4 sts=4 et:
