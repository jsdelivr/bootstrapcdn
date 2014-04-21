'use strict';

function index(req, res) {
    res.render('index', { title: 'Bootstrap CDN', theme: req.query.theme });
}

module.exports = {
    index: index
};

// vim: ft=javascript sw=4 sts=4 et:
