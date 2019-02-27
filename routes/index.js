'use strict';

// This file just holds all route requires
const notFoundRoute = require('./404');
const aboutRoute = require('./about');
const apiRoute = require('./api');
const booksRoute = require('./books');
const bootlintRoute = require('./bootlint');
const bootswatch4Route = require('./bootswatch4');
const bootswatchRoute = require('./bootswatch');
const dataRoute = require('./data');
const fontawesomeRoute = require('./fontawesome');
const indexRoute = require('./home');
const integrationsRoute = require('./integrations');
const jobsRoute = require('./jobs');
const legacyRoutes = require('./legacy');
const privacyPolicyRoute = require('./privacyPolicy');
const redirectToRoot = require('./redirectToRoot');
const showcaseRoute = require('./showcase');
const themesRoute = require('./themes');

const routes = {
    notFoundRoute,
    aboutRoute,
    apiRoute,
    booksRoute,
    bootlintRoute,
    bootswatch4Route,
    bootswatchRoute,
    dataRoute,
    fontawesomeRoute,
    indexRoute,
    integrationsRoute,
    jobsRoute,
    legacyRoutes,
    privacyPolicyRoute,
    redirectToRoot,
    showcaseRoute,
    themesRoute
};

module.exports = routes;

// vim: ft=javascript sw=4 sts=4 et:
