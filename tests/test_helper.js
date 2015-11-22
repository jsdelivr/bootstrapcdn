var path   = require('path');
var fs     = require('fs');
var yaml   = require('js-yaml');
var assert = require('assert');
var format = require('format');
var http   = require('http');
var encode = require('htmlencode').htmlEncode;

function config() {
    return yaml.safeLoad(fs.readFileSync(path.join(__dirname, '..', 'config', '_config.yml'), 'utf8'));
}

function app(config) {
    process.env.PORT = (config.port < 3000 ? config.port + 3000 : config.port + 1); // don't use configured port
    require('../app.js');
    return format('http://localhost:%s/', process.env.PORT);
}

function assertResponse(response, code) {
    code = (code == undefined ? 200 : code);
    assert(response);
    assert.equal(code, response.statusCode);
}

function preFetch(uri, cb) {
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
