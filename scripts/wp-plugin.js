#!/usr/bin/env node

'use strict';

const fs     = require('fs');
const path   = require('path');
const yaml   = require('js-yaml');
const config = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '..', 'config', '_config.yml'), 'utf8'));

const OUT_DIR = path.resolve(__dirname, '..', 'data');

const data = {
    timestamp: new Date(),
    bootstrap: {},
    fontawesome: {}
};

config.bootstrap3.forEach((bootstrap) => {
    data.bootstrap[bootstrap.version] = {
        css: bootstrap.stylesheet,
        js: bootstrap.javascript
    };
});

config.fontawesome.forEach((fontawesome) => {
    data.fontawesome[fontawesome.version] = fontawesome.stylesheet;
});

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

fs.writeFile(
    path.resolve(OUT_DIR, 'bootstrapcdn.json'),
    JSON.stringify(data, null, 2),
    (err) => {
        if (err) {
            console.error('An error occured creating bootstrapcdn.json');
            console.trace(err);
            process.exit(1);
        }
        console.log('Regenerated bootstrapcdn.json');
    }
);
