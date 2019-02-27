'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');
const helpers = require('../lib/helpers.js');

const router = express.Router();

// API documentation.
router.get('/', (req, res) => {
    res = appendLocals(req, res);
    res.render('api.pug', {
        title: 'API',
        description: 'API for BootstrapCDN'
    });
});

// API endpoints.
router.get('/:endpoint/:name/:version?', (req, res) => {
    const { endpoint, name, version } = req.params;
    const data = helpers.api.data(name, version, endpoint);

    helpers.api.send(res, data);
});

// API catch-all bad request.
router.get('*', (req, res) => {
    const data = helpers.api.badRequest();

    helpers.api.send(res, data);
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
