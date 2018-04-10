/* eslint global-require: 0 */
'use strict';

// Force NODE_ENV (and thus 'env' in express)
process.env.NODE_ENV = 'test';

const assert     = require('assert');
const fs         = require('fs');
const path       = require('path');
const format     = require('format');
const htmlEncode = require('htmlencode').htmlEncode;
const request    = require('request');
const validator  = require('html-validator');
const yaml       = require('js-yaml');

let response = {};

// for array of types, first will be chosen when testing strictly
const CONTENT_TYPE_MAP = {
    css: 'text/css; charset=utf-8',
    js: [
        'application/javascript; charset=utf-8',
        'text/javascript',
        'application/x-javascript'
    ],

    // fonts
    eot: 'application/vnd.ms-fontobject',
    svg: 'image/svg+xml',
    ttf: [
        'application/x-font-ttf',
        'font/ttf'
    ],

    woff: 'application/font-woff',
    woff2: 'application/font-woff2',
    otf: 'application/x-font-otf',

    map: 'application/json; charset=utf-8'
};

function extension(str) {
    return str.match(/[A-Za-z0-9]+$/)[0];
}

function assertContentType(uri, contentType) {
    const ext = extension(uri);
    let type  = CONTENT_TYPE_MAP[ext];

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
    const CONFIG_FILE = path.join(__dirname, '..', 'config', '_config.yml');

    return yaml.safeLoad(fs.readFileSync(CONFIG_FILE, 'utf8'));
}

function cleanEndpoint(endpoint = '/') {
    endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    endpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;

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

function assertValidHTML(res, done) {
    const options = {
        data: res.body,
        format: 'text'
    };

    validator(options, (err, data) => {
        if (err) {
            console.trace(err);
        }

        const errors = data.split('\n')
            .filter((e) => {
                if (e.startsWith('Error:')) {
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

function preFetch(uri, cb) {
    const reqOpts = {
        uri,
        forever: true, // for `connection: Keep-Alive`
        gzip: true
    };

    request.get(reqOpts, (err, res, body) => {
        if (err) {
            console.log(err);
        }

        response = res;
        response.body = body;
    })
    .on('complete', () => cb(response))
    .on('error', (err) => {
        console.log(err);
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

function domainCheck(uri) {
    if (typeof process.env.TEST_S3 === 'undefined') {
        return uri;
    }

    return uri.replace('https://stackpath.bootstrapcdn.com/', process.env.TEST_S3);
}

module.exports = {
    config,
    app,
    assert: {
        contentType: assertContentType,
        validHTML: assertValidHTML
    },
    preFetch,
    extension,
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
