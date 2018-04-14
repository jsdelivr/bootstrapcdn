'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('legacy/bootstrap.pug', {
        title: 'Bootstrap Legacy',
        description: 'Older versions of Bootstrap hosted on a CDN'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
