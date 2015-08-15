#!/usr/bin/env node
var path = require('path');
var yaml = require('js-yaml');
var exec = require('child_process').execSync;
var fs   = require('fs');
var sri  = require('sri-toolbox');

var basedir    = path.join(__dirname, '..');
var configFile = path.join(basedir, 'config', '_config.yml');
var config     = yaml.safeLoad(fs.readFileSync(configFile));

// create backup file
fs.createReadStream(configFile)
    .pipe(fs.createWriteStream(configFile + '.bak'));

function buildPath(d) {
    return path.join(basedir, 'public',
        d.replace('https://maxcdn.bootstrapcdn.com/',''));
}

function digest(file) {
    return 'sha256-' +
        exec('cat '  + file + ' | openssl dgst -sha256 -binary | openssl enc -base64 -A').toString()  +
        ' sha512-'   +
        exec('cat '  + file + ' | openssl dgst -sha512 -binary | openssl enc -base64 -A').toString();
}

// bootswatch
var bootswatch = buildPath(config.bootswatch.bootstrap);
for (var i = 0; i < config.bootswatch.themes.length; i++) {
    var theme = config.bootswatch.themes[i];
    var file  = bootswatch.replace('SWATCH_VERSION', config.bootswatch.version)
                          .replace('SWATCH_NAME',    theme.name);

    if (config.bootswatch.themes[i].sri === undefined) {
        config.bootswatch.themes[i].sri = digest(file);
    }
}

// bootlint
for (var i = 0; i < config.bootlint.length; i++) {
    var bootlint = config.bootlint[i];
    var file     = buildPath(bootlint.javascript);

    if (config.bootlint[i].javascript_sri === undefined) {
        config.bootlint[i].javascript_sri = digest(file);
    }
}

// bootstrap
for (var i = 0; i < config.bootstrap.length; i++) {
    var bootstrap = config.bootstrap[i];

    var javascript = buildPath(bootstrap.javascript);
    if (config.bootstrap[i].javascript_sri === undefined) {
        config.bootstrap[i].javascript_sri = digest(javascript);
    }

    var stylesheet = buildPath(bootstrap.stylesheet);
    if (config.bootstrap[i].stylesheet_sri === undefined) {
        config.bootstrap[i].stylesheet_sri = digest(stylesheet);
    }
}

// fontawesome
for (var i = 0; i < config.fontawesome.length; i++) {
    var stylesheet = buildPath(config.fontawesome[i].stylesheet);

    if (config.fontawesome[i].stylesheet_sri === undefined) {
        config.fontawesome[i].stylesheet_sri = digest(stylesheet);
    }
}

fs.writeFileSync(configFile, yaml.dump(config));
