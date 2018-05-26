'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');

const router = express.Router();

router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('jobs.pug', {
        title: 'Jobs Listings via ZipRecruiter',
        description: 'We partnered with ZipRecruiter to bring you relevant job listings. This helps support the maintainers of this site.'
    });
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
