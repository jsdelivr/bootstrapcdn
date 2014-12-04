#!/usr/bin/env node

'use strict';

var fs   = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', 'config', '_config.yml'), 'utf8'));

var data = {
    timestamp: new Date(),
    bootstrap: {},
    fontawesome: {}
};

config.bootstrap.forEach(function(bootstrap) {
    data.bootstrap[bootstrap.version] = {
        css: bootstrap.css_complete,
        js: bootstrap.javascript
    };
});

config.fontawesome.forEach(function(fontawesome) {
    data.fontawesome[fontawesome.version] = fontawesome.css_complete;
});

fs.writeFile(
    path.resolve(__dirname, '..', 'public', 'data', 'bootstrapcdn.json'),
    JSON.stringify(data, null, 2),
    function(err) {
        if (err) {
            console.error('an error occured creating bootstrapcdn.json');
            console.trace(err);
            process.exit(1);
        }
        console.log('regenerated bootstrapcdn.json');
    }
);
