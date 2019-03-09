#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const helpers = require('../lib/helpers');

const OUT_DIR = path.resolve(__dirname, '../data');

const data = helpers.generateDataJson();

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
}

fs.writeFile(
    path.join(OUT_DIR, 'bootstrapcdn.json'),
    JSON.stringify(data, null, 2),
    (error) => {
        if (error) {
            throw new Error(error);
        }

        console.log('Regenerated bootstrapcdn.json');
    }
);
