'use strict';

const express = require('express');
const { appendLocals } = require('../lib/helpers');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('bootstrapIcons.pug', {
        title: 'Bootstrap Icons',
        description: 'The recommended CDN for Bootstrap Icons'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
