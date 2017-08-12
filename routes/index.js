'use strict';

const path      = require('path');
const digest    = require(path.join(__dirname, '..', 'lib', 'helpers')).sri.digest;
const TITLE     = 'BootstrapCDN by MaxCDN';

const SRI_CACHE = {};

function appendLocals(req, res) {
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    res.locals.fullUrl = `${proto}://${req.hostname}${req.path}`;

    res.locals.siteUrl = `${proto}://${req.hostname}`;

    res.locals.theme = req.query.theme;

    res.locals.displayTitle = (title) => `${title} · ${TITLE}`;

    res.locals.bodyClass = (title) => {
        // Remove whitespace from title
        let str = title.replace(' ', '');

        // Make the first letter lowercase
        str = str.charAt(0).toLowerCase() + str.slice(1);

        return `page-${str}`;
    };

    res.locals.generateSRI = (file) => {
        if (typeof SRI_CACHE[file] === 'undefined') {
            SRI_CACHE[file] = digest(path.join(__dirname, '..', 'public', file));
        }

        return SRI_CACHE[file];
    };

    return res;
}

function index(req, res) {
    res = appendLocals(req, res);
    res.render('index', { title: 'Quick Start' });
}

function fontawesome(req, res) {
    res = appendLocals(req, res);
    res.render('fontawesome', { title: 'Font Awesome' });
}

function bootswatch(req, res) {
    res = appendLocals(req, res);
    res.render('bootswatch', { title: 'Bootswatch' });
}

function bootlint(req, res) {
    res = appendLocals(req, res);
    res.render('bootlint', { title: 'Bootlint' });
}

function alpha(req, res) {
    res = appendLocals(req, res);
    res.redirect(301, '/beta/');
}

function beta(req, res) {
    res = appendLocals(req, res);
    res.render('beta', { title: 'Bootstrap 4 Beta' });
}

function legacy(req, res) {
    res = appendLocals(req, res);
    res.render('legacy', { title: 'Bootstrap Legacy' });
}

function showcase(req, res) {
    res = appendLocals(req, res);

    const showcase = req.config.showcase;

    const col1 = [];
    const col2 = [];

    for (let i = 0; i < showcase.length; i++) {
        if (i % 2 === 0) {
            col1.push(showcase[i]);
        } else {
            col2.push(showcase[i]);
        }
    }

    res.render('showcase', {
        title: 'Showcase',
        col1,
        col2
    });
}

function integrations(req, res) {
    res = appendLocals(req, res);

    const integrations = req.config.integrations;

    const col1 = [];
    const col2 = [];

    for (let i = 0; i < integrations.length; i++) {
        if (i % 2 === 0) {
            col1.push(integrations[i]);
        } else {
            col2.push(integrations[i]);
        }
    }

    res.render('integrations', {
        title: 'Integrations',
        col1,
        col2
    });
}

module.exports = {
    index,
    fontawesome,
    bootswatch,
    bootlint,
    alpha,
    beta,
    legacy,
    showcase,
    integrations
};

// vim: ft=javascript sw=4 sts=4 et:
