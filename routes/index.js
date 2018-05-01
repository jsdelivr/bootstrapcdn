'use strict';

const path = require('path');
const helpers = require('../lib/helpers.js');
const digest = helpers.sri.digest;

const SRI_CACHE = {};

function appendLocals(req, res) {
    const totalThemes = helpers.getConfig().bootswatch4.themes.length;
    const TITLE_SUFFIX = 'BootstrapCDN by StackPath';
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    res.locals.canonicalUrl = `${req.config.siteurl}${req.path}`;

    res.locals.siteUrl = `${proto}://${req.hostname}`;

    res.locals.theme = req.query.theme < totalThemes ?
        req.query.theme :
        '';

    res.locals.displayTitle = (title) => `${title} · ${TITLE_SUFFIX}`;

    res.locals.bodyClass = (title) => {
        // Remove any whitespace from the title
        let str = title.replace(/\s/g, '');

        // Make the first letter lowercase
        str = str.charAt(0).toLowerCase() + str.slice(1);

        return `page-${str}`;
    };

    res.locals.generateSRI = (file) => {
        if (typeof SRI_CACHE[file] === 'undefined') {
            SRI_CACHE[file] = digest(path.join(__dirname, '../public', file));
        }

        return SRI_CACHE[file];
    };

    return res;
}

function render404(req, res) {
    res = appendLocals(req, res);
    res.status(404).render('404', {
        title: 'Page Not Found'
    });
}

function renderIndex(req, res) {
    res = appendLocals(req, res);
    res.render('index', {
        title: 'Quick Start'
    });
}

function renderFontawesome(req, res) {
    res = appendLocals(req, res);
    res.render('fontawesome', {
        title: 'Font Awesome',
        description: 'The recommended CDN for Font Awesome'
    });
}

function renderBootswatch(req, res) {
    res = appendLocals(req, res);
    res.render('bootswatch', {
        title: 'Bootswatch',
        description: 'The recommended CDN for Bootswatch'
    });
}

function renderBootswatch4(req, res) {
    res = appendLocals(req, res);
    res.redirect(301, '/bootswatch/');
}

function renderBootlint(req, res) {
    res = appendLocals(req, res);
    res.render('bootlint', {
        title: 'Bootlint',
        description: 'HTML linter for Bootstrap projects hosted on a CDN.'
    });
}

function redirectToRoot(req, res) {
    res = appendLocals(req, res);
    res.redirect(301, '/');
}

function legacy(req, res) {
    res = appendLocals(req, res);
    res.redirect(301, '/legacy/bootstrap/');
}

function renderLegacyBootstrap(req, res) {
    res = appendLocals(req, res);
    res.render('legacy/bootstrap.pug', {
        title: 'Bootstrap Legacy',
        description: 'Older versions of Bootstrap hosted on a CDN'
    });
}

function renderLegacyFontawesome(req, res) {
    res = appendLocals(req, res);
    res.render('legacy/fontawesome.pug', {
        title: 'Font Awesome Legacy',
        description: 'Older versions of Font Awesome hosted on a CDN'
    });
}

function renderLegacyBootswatch(req, res) {
    res = appendLocals(req, res);
    res.render('legacy/bootswatch.pug', {
        title: 'Bootswatch Legacy',
        description: 'Older versions of Bootswatch hosted on a CDN'
    });
}

function renderIntegrations(req, res) {
    res = appendLocals(req, res);
    res.render('integrations', {
        title: 'Integrations',
        description: 'Apps that integrate BootstrapCDN'
    });
}

function renderShowcase(req, res) {
    res = appendLocals(req, res);
    res.render('showcase', {
        title: 'Showcase',
        description: 'Websites and apps that use BootstrapCDN'
    });
}

function renderPrivacyPolicy(req, res) {
    res = appendLocals(req, res);
    res.render('privacy-policy', {
        title: 'Privacy Policy',
        description: 'Read about our Privacy Policy and data usage.'
    });
}

function renderAbout(req, res) {
    res = appendLocals(req, res);
    res.render('about', {
        title: 'About BootstrapCDN',
        description: 'Who we are and what we stand for.'
    });
}

module.exports = {
    legacy,
    redirectToRoot,
    render404,
    renderAbout,
    renderBootlint,
    renderBootswatch,
    renderBootswatch4,
    renderFontawesome,
    renderIndex,
    renderIntegrations,
    renderLegacyBootstrap,
    renderLegacyBootswatch,
    renderLegacyFontawesome,
    renderPrivacyPolicy,
    renderShowcase
};

// vim: ft=javascript sw=4 sts=4 et:
