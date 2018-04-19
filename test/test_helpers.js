/* eslint global-require: 0 */
'use strict';

// Force NODE_ENV (and thus 'env' in express)
process.env.NODE_ENV = 'test';
process.env.ENABLE_CRAWLING = true;

const assert     = require('assert');
const htmlEncode = require('htmlencode').htmlEncode;
const request    = require('request');
const validator  = require('html-validator');
const helpers    = require('../lib/helpers.js');

let response = {};

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
    const re = /(\.)([a-zA-Z0-9]+)$/;

    return str.match(re)[2];
}

function assertContentType(uri, currentType, cb) {
    const ext = getExtension(uri);
    const expectedType = CONTENT_TYPE_MAP[ext];

    assert.equal(expectedType, currentType,
        `Invalid "content-type" for "${ext}", expects "${expectedType}" but got "${currentType}"`);
    cb();
}

function getConfig() {
    return helpers.getConfig();
}

function cleanEndpoint(endpoint = '/') {
    endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    endpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;

    return endpoint;
}

function runApp(cfg, endpoint) {
    const endp = cleanEndpoint(endpoint);
    const port = cfg.port < 3000 ? cfg.port + 3000 : cfg.port + 1;

    // don't use configured port
    process.env.PORT = port;

    // load app
    require('../app.js');

    return `http://localhost:${port}${endp}`;
}

function assertValidHTML(res, done) {
    const options = {
        data: res.body,
        format: 'text'
    };

    validator(options, (err, data) => {
        if (err) {
            return done(err);
        }

        // Return when successful.
        if (data.includes('The document validates')) {
            return done();
        }

        // Formatting output for readability.
        const errStr = `HTML Validation for '${res.request.path}' failed with:\n\t${data.replace('Error: ', '').split('\n').join('\n\t')}\n`;

        return done(new Error(errStr));
    });
}

function assertItWorks(res, done) {
    const ret = assert.equal(200, res);

    done(ret);
}

function assertAuthors(res, done) {
    const config = getConfig();
    const authors = config.authors.map((author) => author.name).join(', ');
    const authorsStr = `<meta name="author" content="${authors}">`;
    const ret = assert(res.body.includes(authorsStr), `Expects response body to include "${authorsStr}"`);

    done(ret);
}

function preFetch(uri, cb) {
    const reqOpts = {
        uri,
        forever: true, // for 'connection: Keep-Alive'
        gzip: true
    };

    request.get(reqOpts, (err, res, body) => {
        if (err) {
            console.log(err);
        }

        response = res;
        response.body = body;
    })
    .on('complete', () => cb(response));
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

function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace('https://stackpath.bootstrapcdn.com/', process.env.TEST_S3);
}

module.exports = {
    getConfig,
    runApp,
    assert: {
        authors: assertAuthors,
        contentType: assertContentType,
        itWorks: assertItWorks,
        validHTML: assertValidHTML
    },
    preFetch,
    getExtension,
    css: {
        pug: cssJade,
        html: cssHTML,
        haml: cssHAML
    },
    javascript: {
        pug: jsJade,
        html: jsHTML,
        haml: jsHAML
    },
    CONTENT_TYPE_MAP,
    domainCheck
};
