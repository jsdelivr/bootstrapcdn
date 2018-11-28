#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('../lib/helpers.js');

const OUT_DIR = path.resolve(__dirname, '../data');

const data = helpers.generateDataJson();

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

fs.writeFile(
    path.join(OUT_DIR, 'bootstrapcdn.json'),
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
