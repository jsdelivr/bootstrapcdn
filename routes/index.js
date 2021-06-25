'use strict';

// This file just holds all route requires
const notFoundRoute = require('./404');
const aboutRoute = require('./about');
const bootlintRoute = require('./bootlint');
const bootswatch4Route = require('./bootswatch4');
const bootswatchRoute = require('./bootswatch');
const dataRoute = require('./data');
const fontawesomeRoute = require('./fontawesome');
const indexRoute = require('./home');
const legacyRoutes = require('./legacy');
const redirectToRoot = require('./redirectToRoot');
const bootstrapIconsRoute = require('./bootstrapIcons');
const themesRoute = require('./themes');
const booksRoute = require('./books');
const integrationsRoute = require('./integrations');
const showcaseRoute = require('./showcase');

const routes = {
    notFoundRoute,
    aboutRoute,
    bootlintRoute,
    bootswatch4Route,
    bootswatchRoute,
    dataRoute,
    fontawesomeRoute,
    indexRoute,
    legacyRoutes,
    redirectToRoot,
    bootstrapIconsRoute,
    themesRoute,
    booksRoute,
    integrationsRoute,
    showcaseRoute
};

module.exports = routes;

// vim: ft=javascript sw=4 sts=4 et:
