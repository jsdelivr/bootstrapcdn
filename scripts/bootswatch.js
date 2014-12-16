#!/usr/bin/env node
// Hacking this together for now, perhaps revisit and clean up.

var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');
var request = require('request');

var version = process.argv[2];
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

fs.mkdir(bootswatchDir, 0755, function(e) {
    errorCheck(e);
    console.log('Created: %s', bootswatchDir);
    files.forEach(function(file) {
        config.bootswatch.themes.forEach(function(theme) {
            file = file.replace('%s', theme);
            request(file, function(e, r, b) {
                errorCheck(e);

                var targetDir = path.join(bootswatchDir, theme);
                fs.mkdir(targetDir, 0755, function(e) {
                    if (!e) console.log('  Created: %s', targetDir);
                    var target = path.join(targetDir, path.basename(file));
                    fs.writeFile(target, b, function(e) {
                        errorCheck(e);
                        console.log('    Saved: %s', target);
                    });
                });
            });
        });
    });

    // Let's redownload known fonts as well...
    //
    // TODO: Revisit this, it's very fragile.
    fs.mkdir(fontsDir, 0755, function(e) {
        if (!e) console.log('  Created: %s', fontsDir);
        [ 'glyphicons-halflings-regular.eot',
            'glyphicons-halflings-regular.svg',
            'glyphicons-halflings-regular.ttf',
            'glyphicons-halflings-regular.woff'
        ].forEach(function(font) {
            fontPath = fonts.replace('%s', font);
            request(fontPath, function(e, r, b) {
                errorCheck(e);
                var target = path.join(fontsDir, font);
                fs.writeFile(target, b, function(e) {
                    errorCheck(e);
                    console.log('    Saved: %s', target);
                });
            });
        });
    });
});

process.on('exit', function (code) {
    if (code === 0) console.log('Don\'t forget to update symlink and config file!');
});
