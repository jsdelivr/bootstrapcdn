'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('privacy-policy.pug', {
        title: 'Privacy Policy',
        description: 'Read about our Privacy Policy and data usage.'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
