var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var assert = require('assert');
var format = require('format');
var encode = require('htmlencode').htmlEncode;

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
    assert: assert,
    assertResponse: assertResponse,
    assertContains: assertContains,
    assertAnalytics: assertAnalytics,
    preFetch: preFetch,
    css: {
        jade: cssJade,
        html: cssHTML,
        haml: cssHAML,
    },
    javascript: {
        jade: jsJade,
        html: jsHTML,
        haml: jsHAML,
    }

};
