'use strict';

const ENV = process.env;

// We use BCDN_HEADERS to distinguish between production and debug CDN headers
ENV.BCDN_HEADERS = ENV.BCDN_HEADERS || 'production';

const assert = require('assert').strict;
const escapeStringRegexp = require('escape-string-regexp');
const { htmlEncode } = require('htmlencode');
const mockDate = require('mockdate');
const request = require('request');
const validator = require('html-validator');

const app = require('../app');
const config = require('../config').app;

// The server object holds the server instance across all tests;
// We start it in the first test and close it in the last one,
// otherwise test time increases a lot (more than 3x)
let server = {};

mockDate.set('03/05/2018');

function getExtension(str) {
    // use two enclosing parts; one for the dot (.)
    // and one for the extension itself.
    // So, the result we want is the third Array element,
    // since the first one is the whole match, the second one
    // returns the first captured match, etc.
    const match = str.match(/(\.)([a-zA-Z0-9]+)$/);

    return match && match[2];
}

function cleanEndpoint(endpoint = '/') {
    // Maybe we should use node's `url` in this function
    if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
    }

    if (!endpoint.endsWith('/') && !endpoint.includes('?') && !getExtension(endpoint)) {
        endpoint = `${endpoint}/`;
    }

    return endpoint;
}

function getPort() {
    // don't use configured port
    const port = config.port < 3000 ? config.port + 3000 : config.port + 1;

    return port;
}

function getURI(endpoint) {
    const endp = cleanEndpoint(endpoint);
    const port = getPort();

    return `http://localhost:${port}${endp}`;
}

function startServer() {
    const port = getPort();

    if (server.listening) {
        return server;
    }

    server = app.listen(port);

    return server;
}

function stopServer(done) {
    return server.listening && server.close(done);
}

function prefetch(uri, cb) {
    const reqOpts = {
        uri,
        forever: true, // for 'connection: Keep-Alive'
        followRedirect: false,
        gzip: true,
        strictSSL: true
    };

    if (ENV.BCDN_HEADERS === 'debug') {
        reqOpts.headers = {
            Pragma: 'debug'
        };
    }

    request.get(reqOpts, (err, res) => {
        if (err) {
            return cb(err);
        }

        return cb(res);
    });
}

function assertValidHTML(res) {
    const options = {
        data: res.body,
        format: 'text'
    };

    return new Promise((resolve, reject) => {
        validator(options)
            .then((data) => {
                // Return when successful.
                if (data.includes('The document validates')) {
                    return resolve();
                }

                // Formatting output for readability.
                const errStr = `HTML Validation for '${res.request.path}' failed with:\n\t${data.replace('Error: ', '').split('\n').join('\n\t')}\n`;

                return reject(new Error(errStr));
            })
            .catch((error) => reject(error));
    });
}

function assertItWorks(statusCode, cb) {
    try {
        assert.equal(statusCode, 200);
        return cb();
    } catch (error) {
        return cb(error);
    }
}

function assertPageHeader(txt, res, cb) {
    const escapedTxt = escapeStringRegexp(txt);
    const re = new RegExp(`<h[1-6]( class=".+")?>(${escapedTxt})(</h[1-6]>)`);

    assert.ok(re.test(res.body), `Expects page header to be "${txt}"`);
    cb();
}

function assertCanonicalUrl(str, res, cb) {
    const expected = `<link rel="canonical" href="${new URL(str, config.siteurl)}">`;

    assert.ok(res.body.includes(expected), 'Expects page to have a canonical URL');
    cb();
}

function assertPageBodyClass(bodyClass, res, cb) {
    const expected = `<body class="${bodyClass}`;

    assert.ok(res.body.includes(expected), `Expects page body class to include "${bodyClass}"`);
    cb();
}

function assertAuthors(res, cb) {
    const authors = config.authors.map((author) => author.name).join(', ');
    const authorsStr = `<meta name="author" content="${authors}">`;

    assert.ok(res.body.includes(authorsStr), `Expects response body to include "${authorsStr}"`);
    cb();
}

function cssHTML(uri, sri) {
    return htmlEncode(`<link href="${uri}" rel="stylesheet" integrity="${sri}" crossorigin="anonymous">`);
}

function cssPug(uri, sri) {
    return htmlEncode(`link(href="${uri}", rel="stylesheet", integrity="${sri}", crossorigin="anonymous")`);
}

function cssHAML(uri, sri) {
    return htmlEncode(`%link{href: "${uri}", rel: "stylesheet", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function jsHTML(uri, sri) {
    return htmlEncode(`<script src="${uri}" integrity="${sri}" crossorigin="anonymous"></script>`);
}

function jsPug(uri, sri) {
    return htmlEncode(`script(src="${uri}", integrity="${sri}", crossorigin="anonymous")`);
}

function jsHAML(uri, sri) {
    return htmlEncode(`%script{src: "${uri}", integrity: "${sri}", crossorigin: "anonymous"}`);
}

module.exports = {
    getExtension,
    getURI,
    startServer,
    stopServer,
    assert: {
        authors: assertAuthors,
        canonicalUrl: assertCanonicalUrl,
        bodyClass: assertPageBodyClass,
        itWorks: assertItWorks,
        pageHeader: assertPageHeader,
        validHTML: assertValidHTML
    },
    prefetch,
    css: {
        pug: cssPug,
        html: cssHTML,
        haml: cssHAML
    },
    javascript: {
        pug: jsPug,
        html: jsHTML,
        haml: jsHAML
    }
};
