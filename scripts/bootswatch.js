#!/usr/bin/env node
// Hacking this together for now, perhaps revisit and clean up.

var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var request = require('sync-request');

var version = process.argv[2];
if (!version) {
    console.log('Please pass the Bootswatch version as an argument.');
    process.exit(1);
}

var basedir = path.join(__dirname, '..');
var bootswatchDir = path.join(basedir, 'public', 'bootswatch', version);
var configFile = path.join(basedir, 'config', '_config.yml');

var config = yaml.safeLoad(fs.readFileSync(configFile));

var files = [
    'http://bootswatch.com/%s/bootstrap.min.css',
    'http://bootswatch.com/%s/bootstrap.css'
];

var fonts = 'http://bootswatch.com/fonts/%s';
var fontsDir = path.join(bootswatchDir, 'fonts');

function errorCheck(err) {
    if (err) {
        console.trace(err);
        process.exit(1);
    }
}

// Fails intentionally if bootswatchDir exists.
fs.mkdirSync(bootswatchDir, 0755);
console.log('Created: %s', bootswatchDir);

files.forEach(function(file) {
    config.bootswatch.themes.forEach(function(theme) {
        var source = file.replace('%s', theme);
        var response = request('GET', source);
        var body = response.getBody();

        if (response.statusCode !== 200) {
            errorCheck(new Error('Non-success status code: ' + response.statusCode));
        }

        var targetDir = path.join(bootswatchDir, theme);

        try {
            fs.mkdirSync(targetDir, 0755);
            console.log('  Created: %s', targetDir);
        } catch(e) {
            /* ignore */
            //console.log('Error:', e.message);
        }

        var target = path.join(targetDir, path.basename(file));
        fs.writeFileSync(target, body);
        console.log('    Saved: %s', target);
        console.log('     From: %s', source);
    });
});

// TODO: Revisit this, it's very fragile.

fs.mkdirSync(fontsDir, 0755);
console.log('  Created: %s', fontsDir);
[ 'glyphicons-halflings-regular.eot',
    'glyphicons-halflings-regular.svg',
    'glyphicons-halflings-regular.ttf',
    'glyphicons-halflings-regular.woff',
    'glyphicons-halflings-regular.woff2'
].forEach(function(font) {
    var fontPath = fonts.replace('%s', font);
    var response = request('GET', fontPath);
    var body = response.getBody();
    var target = path.join(fontsDir, font);
    fs.writeFileSync(target, body);
    console.log('    Saved: %s', target);
    console.log('     From: %s', fontPath);
});

process.on('exit', function (code) {
    if (code === 0) {
        console.log('Don\'t forget to update symlink and config file!');
    }
});
