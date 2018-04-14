'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.redirect(301, '/bootswatch/');
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
