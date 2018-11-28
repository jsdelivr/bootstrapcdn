'use strict';

const express = require('express');
const helpers = require('../lib/helpers.js');

const router = express.Router();

router.get('/', (req, res) => {
    const data = helpers.generateDataJson();

    res.send(data);
});

module.exports = router;

// vim: ft=javascript sw=4 sts=4 et:
