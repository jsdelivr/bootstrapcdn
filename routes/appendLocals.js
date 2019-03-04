'use strict';

const path = require('path');
const helpers = require('../lib/helpers.js');
const config = require('../config');

const { digest } = helpers.sri;
const PUBLIC_DIR = path.join(__dirname, '../public/');
const SRI_CACHE = {};

function getCurrentSiteurl(req) {
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    return `${proto}://${req.hostname}`;
}

function getPageTitle(pageTitle) {
    return `${pageTitle} · ${config.title_suffix}`;
}

function getThemeQuery(req) {
    const totalThemes = config.bootswatch4.themes.length;
    const query = req.query.theme;

    // Safety checks
    if (Number.isNaN(query) || query < 0 || query >= totalThemes) {
        return '';
    }

    return query;
}

function generateBodyClass(pathname) {
    if (pathname === '/') {
        pathname = 'home'; // only for the index page
    }

    pathname = pathname.replace(/\//g, ''); // remove any slashes

    // Make the first letter lowercase
    pathname = pathname.charAt(0).toLowerCase() + pathname.slice(1);

    return `page-${pathname}`;
}

function generateSRI(file) {
    if (typeof SRI_CACHE[file] === 'undefined') {
        SRI_CACHE[file] = digest(path.join(PUBLIC_DIR, file));
    }

    return SRI_CACHE[file];
}

function appendLocals(req, res) {
    const siteUrl = getCurrentSiteurl(req);
    const pageUrl = req.originalUrl;
    // OK, hack-ish way...
    const pathname = pageUrl.split('?')[0];
    const canonicalUrl = new URL(pathname, config.siteurl);
    const theme = getThemeQuery(req);
    const bodyClass = generateBodyClass(pathname);

    const locals = {
        siteUrl,
        canonicalUrl,
        pageUrl,
        theme,
        getPageTitle,
        bodyClass,
        generateSRI
    };

    res.locals = Object.assign(res.locals, locals);

    return res;
}

module.exports = appendLocals;

// vim: ft=javascript sw=4 sts=4 et:
