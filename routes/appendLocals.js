'use strict';

const { app, files } = require('../config');

function getCurrentSiteurl(req) {
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    return `${proto}://${req.hostname}`;
}

function getThemeQuery(req) {
    const totalThemes = files.bootswatch4.themes.length;
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

function appendLocals(req, res) {
    const siteUrl = getCurrentSiteurl(req);
    const pageUrl = req.originalUrl;
    // OK, hack-ish way...
    const pathname = pageUrl.split('?')[0];
    const canonicalUrl = new URL(pathname, app.siteurl);
    const theme = getThemeQuery(req);
    const bodyClass = generateBodyClass(pathname);

    const locals = {
        siteUrl,
        canonicalUrl,
        pageUrl,
        theme,
        bodyClass
    };

    res.locals = Object.assign(res.locals, locals);

    return res;
}

module.exports = appendLocals;

// vim: ft=javascript sw=4 sts=4 et:
