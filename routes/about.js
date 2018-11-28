'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('about.pug', {
        title: 'About BootstrapCDN',
        description: 'Who we are and what we stand for.'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
