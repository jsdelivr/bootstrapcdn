/* eslint global-require: 0 */
'use strict';

// Force NODE_ENV (and thus 'env' in express)
process.env.NODE_ENV = 'test';

const fs        = require('fs');
const path      = require('path');
const assert    = require('assert');
const yaml      = require('js-yaml');
const format    = require('format');
const encode    = require('htmlencode').htmlEncode;
const validator = require('html-validator');

let response  = {};

// for array of types, first will be chosen when testing strictly
const CONTENT_TYPE_MAP = {
    css: 'text/css',
    js: ['application/javascript',
        'text/javascript',
        'application/x-javascript'
    ],

    // fonts
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
    ttf: ['application/x-font-ttf',
        'font/ttf'
    ],

    woff: 'application/font-woff',
    woff2: 'application/font-woff2',
    otf: 'application/x-font-otf'
};

function extension(str) {
    return str.match(/[A-Za-z0-9]+$/)[0];
}

function assertContentType(uri, contentType) {
    const ext  = extension(uri);
    let type = CONTENT_TYPE_MAP[ext];

    // Making TEST_STRICT=true default, pass TEST_STRICT=false to disable
    // strict checking.

    if (process.env.TEST_STRICT === 'false' && Array.isArray(type)) {
        assert(type.includes(contentType),
            format('invalid content-type for "%s", expected one of "%s" but got "%s"',
                ext, type.join('", "'), contentType));
    } else {
        type = Array.isArray(type) ? type[0] : type;

        assert.equal(type, contentType,
            format('invalid content-type for "%s", expected "%s" but got "%s"',
                ext, type, contentType));
    }
}

function config() {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_config.yml'), 'utf8'));
}

function cleanEndpoint(endpoint = '/') {
    endpoint = endpoint[0] === '/' ? endpoint : `/${endpoint}`;
    endpoint = endpoint[endpoint.length - 1] === '/' ? endpoint : `${endpoint}/`;

    return endpoint;
}

function app(config, endpoint) {
    endpoint = cleanEndpoint(endpoint);

    // don't use configured port
    process.env.PORT = config.port < 3000 ? config.port + 3000 : config.port + 1;

    // load app
    require('../app.js');
    return format('http://localhost:%s%s', process.env.PORT, endpoint);
}

function assertResponse(response, code = 200) {
    assert(response);
    assert.equal(code, response.statusCode);
}

function assertContains(needle, haystack) {
    assert(haystack.indexOf(needle) > 0);
}

function assertValidHTML(response, done) {
    const options = {
        data: response.body,
        format: 'text'
    };

    validator(options, (err, data) => {
        if (err) {
            console.trace(err);
        }

        const errors = data.split('\n')
            .filter((e) => {
                if (e.match(/^Error:/)) {
                    return true;
                }
                return false;
            })
            .filter((e) => {
                const ignores = [];

                for (let i = 0, len = ignores.length; i < len; i++) {
                    if (e.match(ignores[i])) {
                        console.log(`\n>> (IGNORED) ${e}`);
                        return false;
                    }
                }
                console.error(`\n>> ${e}\n`);
                return true;
            });

        if (errors.length > 0) {
            const sep = '\n\t - ';

            assert(false, sep + errors.join(sep));
        } else {
            assert(true);
        }
        done();
    });
}

function preFetch(uri, cb, http = require('http')) {
    http.get(uri, (res) => {
        response = res;
        response.body = '';
        res.on('data', (chunk) => {
            response.body += chunk;
        });
        res.on('end', () => cb(response));
    });
}

function cssHTML(uri, sri) {
    return encode(`<link href="${uri}" rel="stylesheet" integrity="${sri}" crossorigin="anonymous">`);
}

function cssJade(uri, sri) {
    return encode(`link(href="${uri}", rel="stylesheet", integrity="${sri}", crossorigin="anonymous")`);
}

function cssHAML(uri, sri) {
    return encode(`%link{href: "${uri}", rel: "stylesheet", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function jsHTML(uri, sri) {
    return encode(`<script src="${uri}" integrity="${sri}" crossorigin="anonymous"></script>`);
}

function jsJade(uri, sri) {
    return encode(`script(src="${uri}", integrity="${sri}", crossorigin="anonymous")`);
}

function jsHAML(uri, sri) {
    return encode(`%script{src: "${uri}", integrity: "${sri}", crossorigin: "anonymous"}`);
}

function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace('https://maxcdn.bootstrapcdn.com/', process.env.TEST_S3);
}

module.exports = {
    config,
    app,
    assert: {
        response:    assertResponse,
        contains:    assertContains,
        contentType: assertContentType,
        validHTML:   assertValidHTML
    },
    preFetch,
    extension,
    css: {
        pug:  cssJade,
        html: cssHTML,
        haml: cssHAML
    },
    javascript: {
        pug:  jsJade,
        html: jsHTML,
        haml: jsHAML
    },
    CONTENT_TYPE_MAP,
    domainCheck
};
