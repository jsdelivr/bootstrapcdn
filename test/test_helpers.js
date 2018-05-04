/* eslint global-require: 0 */
'use strict';

// Force NODE_ENV (and thus 'env' in express)
process.env.NODE_ENV = 'test';
process.env.ENABLE_CRAWLING = true;

const assert = require('assert').strict;
const htmlEncode = require('htmlencode').htmlEncode;
const mockDate = require('mockdate');
const request = require('request');
const validator = require('html-validator');
const helpers = require('../lib/helpers.js');

mockDate.set('03/05/2018');

const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: 'application/javascript; charset=utf-8',

    map: 'application/json; charset=utf-8',

    // images
    png: 'image/png',
    svg: 'image/svg+xml',

    // fonts
    eot: 'application/vnd.ms-fontobject',
    otf: 'application/x-font-otf',
    ttf: 'application/x-font-ttf',
    woff: 'application/font-woff',
    woff2: 'application/font-woff2'
};

function getExtension(str) {
    // use two enclosing parts; one for the dot (.)
    // and one for the extension itself.
    // So, the result we want is the third Array element,
    // since the first one is the whole match, the second one
    // returns the first captured match, etc.
    const match = str.match(/(\.)([a-zA-Z0-9]+)$/);

    return match && match[2];
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function assertContentType(uri, currentType, cb) {
    const ext = getExtension(uri);
    const expectedType = CONTENT_TYPE_MAP[ext];

    assert.strictEqual(currentType, expectedType,
        `Invalid "content-type" for "${ext}", expects "${expectedType}" but got "${currentType}"`);
    cb();
}

function getConfig() {
    return helpers.getConfig();
}

function cleanEndpoint(endpoint = '/') {
    if (!endpoint.startsWith('/')) {
        endpoint = `/${endpoint}`;
    }
    if (!endpoint.endsWith('/') && !getExtension(endpoint)) {
        endpoint = `${endpoint}/`;
    }

    return endpoint;
}

function runApp(endpoint) {
    const config = getConfig();
    const endp = cleanEndpoint(endpoint);
    const port = config.port < 3000 ? config.port + 3000 : config.port + 1;

    // don't use configured port
    process.env.PORT = port;

    // load app
    require('../bin/www.js');

    return `http://localhost:${port}${endp}`;
}

function assertValidHTML(res, cb) {
    const options = {
        data: res.body,
        format: 'text'
    };

    validator(options, (err, data) => {
        if (err) {
            return cb(err);
        }

        // Return when successful.
        if (data.includes('The document validates')) {
            return cb();
        }

        // Formatting output for readability.
        const errStr = `HTML Validation for '${res.request.path}' failed with:\n\t${data.replace('Error: ', '').split('\n').join('\n\t')}\n`;

        return cb(new Error(errStr));
    });
}

function assertItWorks(res, cb) {
    try {
        assert.strictEqual(200, res);
        return cb();
    } catch (err) {
        return cb(err);
    }
}

function assertPageHeader(txt, res, cb) {
    const escapedTxt = escapeRegExp(txt);
    const re = new RegExp(`<h[1-6]( class=".+")?>(${escapedTxt})(</h[1-6]>)`);

    assert.ok(re.test(res.body), `Expects page header to be "${txt}"`);
    cb();
}

function assertAuthors(res, cb) {
    const config = getConfig();
    const authors = config.authors.map((author) => author.name).join(', ');
    const authorsStr = `<meta name="author" content="${authors}">`;

    assert.ok(res.body.includes(authorsStr), `Expects response body to include "${authorsStr}"`);
    cb();
}

function prefetch(uri, cb) {
    const reqOpts = {
        uri,
        forever: true, // for 'connection: Keep-Alive'
        followRedirect: false,
        gzip: true
    };

    request.get(reqOpts, (err, res) => {
        if (err) {
            return cb(err);
        }

        return cb(res);
    });
}

function cssHTML(uri, sri) {
    return htmlEncode(`<link href="${uri}" rel="stylesheet" integrity="${sri}" crossorigin="anonymous">`);
}

function cssJade(uri, sri) {
    return htmlEncode(`link(href="${uri}", rel="stylesheet", integrity="${sri}", crossorigin="anonymous")`);
}

function cssHAML(uri, sri) {
    return htmlEncode(`%link{href: "${uri}", rel: "stylesheet", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function jsHTML(uri, sri) {
    return htmlEncode(`<script src="${uri}" integrity="${sri}" crossorigin="anonymous"></script>`);
}

function jsJade(uri, sri) {
    return htmlEncode(`script(src="${uri}", integrity="${sri}", crossorigin="anonymous")`);
}

function jsHAML(uri, sri) {
    return htmlEncode(`%script{src: "${uri}", integrity: "${sri}", crossorigin: "anonymous"}`);
}

module.exports = {
    getConfig,
    runApp,
    assert: {
        authors: assertAuthors,
        contentType: assertContentType,
        itWorks: assertItWorks,
        pageHeader: assertPageHeader,
        validHTML: assertValidHTML
    },
    prefetch,
    css: {
        pug: cssJade,
        html: cssHTML,
        haml: cssHAML
    },
    javascript: {
        pug: jsJade,
        html: jsHTML,
        haml: jsHAML
    }
};
