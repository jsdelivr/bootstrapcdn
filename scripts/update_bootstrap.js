#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

let version = process.argv[2];

if (!version) {
    console.log('Valid Bootstrap version required.');
    process.exit(1);
}

// strip leading 'v' if present
version = version.replace(/^v/, '');

const basedir = path.join(__dirname, '..');
const bootstrapSrcDir = path.join(basedir, 'node_modules/bootstrap/dist');
const bootstrapDistDir = path.join(basedir, 'cdn', 'twitter-bootstrap', version);

if (fs.existsSync(bootstrapDistDir)) {
    console.log('Bootstrap version already found.');
    process.exit(1);
}

fs.mkdirSync(bootstrapDistDir);

try {
    fse.copySync(`${bootstrapSrcDir}`, `${bootstrapDistDir}`, {
        overwrite: false,
        errorOnExist: true,
        preserveTimestamps: true
    });
    console.log(`Successfully copied "${bootstrapSrcDir}" to "${bootstrapDistDir}"`);
    console.log(`\nDo not forget to update "${path.normalize('config/_config.yml')}"!`);
} catch (err) {
    throw new Error(err);
}
