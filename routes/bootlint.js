'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('bootlint.pug', {
        title: 'Bootlint',
        description: 'HTML linter for Bootstrap projects hosted on a CDN.'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
