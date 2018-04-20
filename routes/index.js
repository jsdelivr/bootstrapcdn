'use strict';

const path   = require('path');
const digest = require('../lib/helpers.js').sri.digest;

const SRI_CACHE = {};

function appendLocals(req, res) {
    const TITLE_SUFFIX = 'BootstrapCDN by StackPath';
    let proto = req.get('x-forwarded-proto');

    if (typeof proto === 'undefined') {
        proto = req.protocol;
    }

    res.locals.fullUrl = `${proto}://${req.hostname}${req.path}`;

    res.locals.siteUrl = `${proto}://${req.hostname}`;

    res.locals.theme = req.query.theme;

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
            SRI_CACHE[file] = digest(path.join(__dirname, '..', 'public', file));
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

    const integrations = req.config.integrations;

    const col1 = [];
    const col2 = [];

    for (let i = 0; i < integrations.length; i++) {
        if (i % 2 === 0) {
            col1.push(integrations[i]);
        } else {
            col2.push(integrations[i]);
        }
    }

    res.render('integrations', {
        title: 'Integrations',
        description: 'Apps that integrate BootstrapCDN',
        col1,
        col2
    });
}

function renderShowcase(req, res) {
    res = appendLocals(req, res);

    const showcase = req.config.showcase;

    const col1 = [];
    const col2 = [];

    for (let i = 0; i < showcase.length; i++) {
        if (i % 2 === 0) {
            col1.push(showcase[i]);
        } else {
            col2.push(showcase[i]);
        }
    }

    res.render('showcase', {
        title: 'Showcase',
        description: 'Websites and apps that use BootstrapCDN',
        col1,
        col2
    });
}

function renderPrivacyPolicy(req, res) {
    res = appendLocals(req, res);
    res.render('privacy-policy', {
        title: 'Privacy Policy',
        description: 'Read about our Privacy Policy and data usage.'
    });
}

module.exports = {
    render404,
    renderIndex,
    renderFontawesome,
    renderBootswatch,
    renderBootswatch4,
    renderBootlint,
    redirectToRoot,
    legacy,
    renderLegacyBootstrap,
    renderLegacyBootswatch,
    renderLegacyFontawesome,
    renderIntegrations,
    renderShowcase,
    renderPrivacyPolicy
};

// vim: ft=javascript sw=4 sts=4 et:
