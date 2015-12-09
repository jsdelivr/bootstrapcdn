var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var assert = require('assert');
var format = require('format');
var encode = require('htmlencode').htmlEncode;
var MaxCDN = require('maxcdn');

// set environment defaults
process.env.MAXCDN_ALIAS      = 'alias';
process.env.MAXCDN_API_KEY    = 'apikey';
process.env.MAXCDN_API_SECRET = 'apisecret';
process.env.CACHE_STORE       = path.join(__dirname, 'stubs', 'popular.json');

// for array of types, first will be choosen when testing strictly
var CONTENT_TYPE_MAP = {
    css:  'text/css',
    js:   ['application/javascript',
            'text/javascript',
            'application/x-javascript' ],

    // fonts
    eot:   'application/vnd.ms-fontobject',
    svg:   'image/svg+xml',
    ttf:   ['application/x-font-ttf',
            'font/ttf'],

    woff:  'application/font-woff',
    woff2: 'application/font-woff2',
    otf:   'application/x-font-otf'
};

function assertContentType(uri, content_type) {
    var ext  = extension(uri);
    var type = CONTENT_TYPE_MAP[ext];

    if (Array.isArray(type)) {
        if (process.env.TEST_STRICT === 'true') {
            type = type[0];
        } else {
            return assert(type.indexOf(content_type) >= 0,
                format('invalid content-type for "%s", expected one of "%s" but got "%s"',
                       ext, type.join('", "'), content_type));
        }
    }

    assert.equal(CONTENT_TYPE_MAP[ext], content_type,
        format('invalid content-type for "%s", expected "%s" but got "%s"',
               ext, type, content_type));
}

function extension(str) {
    return str.match(/[A-Za-z0-9]+$/)[0];
}

function config() {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_config.yml'), 'utf8'));
}

function cleanEndpoint(endpoint) {
    endpoint = (endpoint === undefined ? '/' : endpoint);
    endpoint = (endpoint[0] !== '/' ? '/'+endpoint : endpoint);
    endpoint = (endpoint[endpoint.length-1] !== '/' ? endpoint+'/' : endpoint);

    return endpoint;
}

function app(config, endpoint) {
    endpoint = cleanEndpoint(endpoint);

    // don't use configured port
    process.env.PORT = (config.port < 3000 ? config.port + 3000 : config.port + 1);

    // load app
    require('../app.js');
    return format('http://localhost:%s%s', process.env.PORT, endpoint);
}

function assertResponse(response, code) {
    code = (code == undefined ? 200 : code);
    assert(response);
    assert.equal(code, response.statusCode);
}

function assertContains(needle, haystack) {
    assert(haystack.indexOf(needle) > 0);
}

function assertAnalytics(response, config) {
    assertContains(config.google_analytics.account_id, response.body);
    assertContains(config.google_analytics.domain_name, response.body);
    assertContains('https://www.google-analytics.com/analytics.js', response.body);
}

function preFetch(uri, cb, http) {
    http = (http === undefined ? require('http') : http);
    http.get(uri, function(res) {
        response = res;
        response.body = '';
        res.on('data', function(chunk) {
            response.body += chunk;
        });
        res.on('end', function() {
            cb(response);
        });
    });
}

// stub maxcdn.get
function maxcdnStubGet(res, err) {
    MaxCDN.prototype.get = function getStub(_, callback) {
        callback(err, res);
    }
}


function cssHTML(uri, sri) {
    return encode("<link href=\""+uri+"\" rel=\"stylesheet\" integrity=\""+sri+"\" crossorigin=\"anonymous\">");
}

function cssJade(uri, sri) {
    return encode("link(href=\""+uri+"\", rel=\"stylesheet\", integrity=\""+sri+"\", crossorigin=\"anonymous\")");
}

function cssHAML(uri, sri) {
    return encode("%link{href: \""+uri+"\", rel: \"stylesheet\", integrity: \""+sri+"\", crossorigin: \"anonymous\"}");
}

function jsHTML(uri, sri) {
    return encode("<script src=\""+uri+"\" integrity=\""+sri+"\" crossorigin=\"anonymous\"></script>");
}

function jsJade(uri, sri) {
    return encode("script(src=\""+uri+"\", integrity=\""+sri+"\", crossorigin=\"anonymous\")");
}

function jsHAML(uri, sri) {
    return encode("%script{src: \""+uri+"\", integrity: \""+sri+"\", crossorigin: \"anonymous\"}");
}


module.exports = {
    config: config,
    app: app,
    assert: {
        response:    assertResponse,
        contains:    assertContains,
        analytics:   assertAnalytics,
        contentType: assertContentType
    },
    preFetch: preFetch,
    maxcdnStubGet: maxcdnStubGet,
    extension: extension,
    css: {
        jade: cssJade,
        html: cssHTML,
        haml: cssHAML,
    },
    javascript: {
        jade: jsJade,
        html: jsHTML,
        haml: jsHAML,
    },
    CONTENT_TYPE_MAP: CONTENT_TYPE_MAP
};
