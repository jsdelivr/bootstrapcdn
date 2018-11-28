'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('themes.pug', {
        title: 'Bootstrap Themes',
        description: 'Bootstrap Themes from WrapBootstrap.'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
