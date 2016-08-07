#!/usr/bin/env node

'use strict';

var yaml    = require('js-yaml');
var path    = require('path');
var fs      = require('fs');
var request = require('request');

var version = process.argv[2];

if (!version) {
    console.log('Please pass the Bootswatch version as an argument.');
    process.exit(1);
}

var basedir       = path.join(__dirname, '..');
var bootswatchDir = path.join(basedir, 'public', 'bootswatch', version);
var configFile    = path.join(basedir, 'config', '_config.yml');

var config = yaml.safeLoad(fs.readFileSync(configFile));

var files = [
    'https://www.bootswatch.com/%s/bootstrap.min.css',
    'https://www.bootswatch.com/%s/bootstrap.css'
];

var fonts    = 'https://www.bootswatch.com/fonts/%s';
var fontsDir = path.join(bootswatchDir, 'fonts');

function errorCheck(err) {
    if (err) {
        console.trace(err);
        process.exit(1);
    }
}

function checkDirSync(dir) {
    try {
        fs.statSync(dir);
    } catch (e) {
        fs.mkdirSync(dir);
        console.log('Created: %s', dir);
    }
}

checkDirSync(bootswatchDir);

files.forEach(function(file) {
    config.bootswatch.themes.forEach(function(theme) {
        var source = file.replace('%s', theme.name);

        request.get(source, function(err, res, body) {
            if (res.statusCode !== 200) {
                console.log(source, 'not found');
                return;
            }
            var targetDir = path.join(bootswatchDir, theme.name);

            checkDirSync(targetDir);

            var target = path.join(targetDir, path.basename(file));

            fs.writeFileSync(target, body);
            console.log('  Saved: %s', target);
            console.log('    From: %s', source);
        });
    });
});

checkDirSync(fontsDir);

['glyphicons-halflings-regular.eot',
    'glyphicons-halflings-regular.svg',
    'glyphicons-halflings-regular.ttf',
    'glyphicons-halflings-regular.woff',
    'glyphicons-halflings-regular.woff2'
].forEach(function(font) {
    var fontPath = fonts.replace('%s', font);
    var target   = path.join(fontsDir, font);

    request
        .get(fontPath)
        .on('response', function(res) {
            if (res.statusCode !== 200) {
                errorCheck(new Error('Non-success status code: ' + res.statusCode));
            }
            console.log('  Saved: %s', target);
            console.log('    From: %s', fontPath);
        })
        .on('error', function(err) {
            console.trace(err);
        })
        .pipe(fs.createWriteStream(target));
});

process.on('exit', function (code) {
    if (code === 0) {
        console.log('Don\'t forget to update the symlink and config file!');
    }
});
