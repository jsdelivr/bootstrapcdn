'use strict';

const express = require('express');
const appendLocals = require('./appendLocals.js');
const config = require('../config');

const router = express.Router();

function badRequest(res, message = 'Bad Request.') {
    res.status(400).json({
        status: 400,
        message: `${message} Visit ${config.siteurl}/api for documentation.`
    });
}

function notFound(res, message = 'Not found.') {
    res.status(404).json({
        status: 404,
        message: `${message} Visit ${config.siteurl}/api for documentation.`
    });
}

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
    res = appendLocals(req, res);

    const { endpoint, name, version } = req.params;

    // Invalid endpoint or package.
    if (!endpoint || !config.api[endpoint] || !name) {
        return badRequest(res);
    }

    // Unknown package (without version).
    if (!config.api[endpoint][name] && !version) {
        return notFound(res, `Couldn't fetch versions for ${name}.`);
    // Unknown package (with version).
    } else if (!config.api[endpoint][name]) {
        return notFound(res, `Couldn't find ${name}/${version}.`);
    }

    // Valid package, retrieve the data from the API.
    const data = Object.assign({}, config.api[endpoint][name]);

    // If a specific version wasn't specified, show all versions available.
    if (!version) {
        // Remove all assets since this is just showing versions.
        delete data.assets;
        res.json(data);
        return null;
    }

    // Version was specified, but doesn't exist.
    if (!data.assets[version]) {
        return notFound(res, `Couldn't find version ${version} for ${name}. Make sure you use a specific version number, and not a version range or a tag.`);
    }

    // Valid version, show assets.
    return res.json(data.assets[version]);
});

// API catch-all bad request.
router.get('*', (req, res) => badRequest(res));

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
