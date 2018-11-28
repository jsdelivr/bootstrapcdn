'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/bootstrap/', (req, res) => {
    res = appendLocals(req, res);
    res.render('legacy/bootstrap.pug', {
        title: 'Bootstrap Legacy',
        description: 'Older versions of Bootstrap hosted on a CDN'
    });
});

router.get('/bootswatch/', (req, res) => {
    res = appendLocals(req, res);
    res.render('legacy/bootswatch.pug', {
        title: 'Bootswatch Legacy',
        description: 'Older versions of Bootswatch hosted on a CDN'
    });
});

router.get('/bootlint/', (req, res) => {
    res = appendLocals(req, res);
    res.render('legacy/bootlint.pug', {
        title: 'Bootlint Legacy',
        description: 'Older versions of Bootlint hosted on a CDN'
    });
});

router.get('/fontawesome/', (req, res) => {
    res = appendLocals(req, res);
    res.render('legacy/fontawesome.pug', {
        title: 'Font Awesome Legacy',
        description: 'Older versions of Font Awesome hosted on a CDN'
    });
});

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.redirect(301, '/legacy/bootstrap/');
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
