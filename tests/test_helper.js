var w3cjs  = require('w3cjs');
var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var assert = require('assert');
var format = require('format');
var encode = require('htmlencode').htmlEncode;

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

    // Making TEST_STRICT=true default, pass TEST_STRICT=false to disable
    // strict checking.

    if (process.env.TEST_STRICT === 'false' && Array.isArray(type)) {
        return assert(type.indexOf(content_type) >= 0,
            format('invalid content-type for "%s", expected one of "%s" but got "%s"',
                   ext, type.join('", "'), content_type));
    }

    type = Array.isArray(type) ? type[0] : type;

    assert.equal(type, content_type,
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

function assertValidHTML(body, done) {
    w3cjs.validate({
        input: body,
        callback: function(res) {
            var errors = res.messages.filter(function(message) {
                var match = message.message.match(/^Attribute.+integrity.+at this point./);
                if (message.type === 'error' && !match) return true;
            });

            if (errors.length > 0) {
                // mocha always stops after the first assertion failure.
                var err = errors[0];
                assert(false,
                       err.message + ' ['
                       + err.lastLine + ':'
                       + err.firstColumn + '] and '
                       + (errors.length-1) + ' other errors.');
            } else {
                assert(true);
            }

            done();
        }
    });
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

function domainCheck(uri) {
    if (process.env.TEST_S3 === undefined) return uri;

    return uri.replace('https://maxcdn.bootstrapcdn.com/', process.env.TEST_S3);
}

module.exports = {
    config: config,
    app: app,
    assert: {
        response:    assertResponse,
        contains:    assertContains,
        analytics:   assertAnalytics,
        contentType: assertContentType,
        validHTML:   assertValidHTML
    },
    preFetch: preFetch,
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
    CONTENT_TYPE_MAP: CONTENT_TYPE_MAP,
    domainCheck: domainCheck
};
