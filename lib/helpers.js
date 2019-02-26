'use strict';

const fs = require('fs');
const path = require('path');
const sri = require('sri-toolbox');

const { app, files } = require('../config');

const PUBLIC_DIR = path.join(__dirname, '../public/');
const SRI_CACHE = {};

function capitalize(str) {
    if (typeof str !== 'string') {
        return '';
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSri(file, fromString) {
    if (typeof SRI_CACHE[file] === 'undefined') {
        file = fromString ? file : fs.readFileSync(path.join(PUBLIC_DIR, file));

        SRI_CACHE[file] = sri.generate({ algorithms: ['sha384'] }, file);
    }

    return SRI_CACHE[file];
}

function generateDataJson() {
    const data = {
        timestamp: new Date().toISOString(),
        bootstrap: {},
        bootswatch4: {},
        bootswatch3: {},
        bootlint: {},
        fontawesome: {}
    };

    files.bootstrap.forEach((bootstrap) => {
        const bootstrapVersion = bootstrap.version;

        data.bootstrap[bootstrapVersion] = {
            css: bootstrap.stylesheet,
            cssSri: bootstrap.stylesheetSri,
            js: bootstrap.javascript,
            jsSri: bootstrap.javascriptSri
        };

        if (bootstrap.javascriptBundle) {
            data.bootstrap[bootstrapVersion].jsBundle = bootstrap.javascriptBundle;
            data.bootstrap[bootstrapVersion].jsBundleSri = bootstrap.javascriptBundleSri;
        }
    });

    ['bootswatch3', 'bootswatch4'].forEach((key) => {
        files[key].themes.forEach((theme) => {
            const uri = files[key].bootstrap
                .replace('SWATCH_NAME', theme.name)
                .replace('SWATCH_VERSION', files[key].version);

            data[key][theme.name] = {
                uri,
                sri: theme.sri
            };
        });
    });

    files.bootlint.forEach((bootlint) => {
        data.bootlint[bootlint.version] = {
            uri: bootlint.javascript,
            sri: bootlint.javascriptSri
        };
    });

    files.fontawesome.forEach((fontawesome) => {
        data.fontawesome[fontawesome.version] = fontawesome.stylesheet;
    });

    return data;
}

function getCurrentSiteurl(req) {
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    return `${proto}://${req.hostname}`;
}

function getPageTitle(pageTitle) {
    return `${pageTitle} · ${app.title_suffix}`;
}

function generateBodyClass(pathname) {
    if (pathname === '/') {
        return 'page-home'; // only for the homepage
    }

    // Remove any backslashes
    pathname = pathname.replace(/\//g, '');

    // Make the first letter lowercase
    pathname = pathname.charAt(0).toLowerCase() + pathname.slice(1);

    return `page-${pathname}`;
}

function selectedTheme(selected) {
    const totalThemes = files.bootswatch4.themes.length;
    const theme = Number.parseInt(selected, 10);

    if (Number.isNaN(theme) || theme < 0 || theme >= totalThemes) {
        return app.theme;
    }

    return theme;
}

function getTheme(selected) {
    const { themes } = files.bootswatch4;

    selected = selectedTheme(selected);

    return {
        uri: files.bootswatch4.bootstrap
            .replace('SWATCH_VERSION', files.bootswatch4.version)
            .replace('SWATCH_NAME', themes[selected].name),
        sri: themes[selected].sri
    };
}

function appendLocals(req, res) {
    const siteUrl = getCurrentSiteurl(req);
    const pageUrl = req.originalUrl;
    // OK, hack-ish way...
    const pathname = pageUrl.split('?')[0];
    const canonicalUrl = new URL(pathname, app.siteurl);
    const theme = selectedTheme(req.query.theme);
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

module.exports = {
    appendLocals,
    capitalize,
    generateDataJson,
    theme: {
        get: getTheme,
        selected: selectedTheme
    },
    getCurrentSiteurl,
    getPageTitle,
    generateBodyClass,
    generateSri
};

// vim: ft=javascript sw=4 sts=4 et:
