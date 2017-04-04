#!/usr/bin/env node

'use strict';

const fs     = require('fs');
const path   = require('path');
const yaml   = require('js-yaml');
const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', 'config', '_config.yml'), 'utf8'));

const data = {
    timestamp: new Date(),
    bootstrap: {},
    fontawesome: {}
};

config.bootstrap.forEach((bootstrap) => {
    data.bootstrap[bootstrap.version] = {
        css: bootstrap.css_complete,
        js:  bootstrap.javascript
    };
});

config.fontawesome.forEach((fontawesome) => {
    data.fontawesome[fontawesome.version] = fontawesome.css_complete;
});

fs.writeFile(
    path.resolve(__dirname, '..', 'public', 'data', 'bootstrapcdn.json'),
    JSON.stringify(data, null, 2),
    (err) => {
        if (err) {
            console.error('an error occured creating bootstrapcdn.json');
            console.trace(err);
            process.exit(1);
        }
        console.log('regenerated bootstrapcdn.json');
    }
);
