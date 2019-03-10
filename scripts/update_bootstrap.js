#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

(() => {
    let version = process.argv[2];

    if (!version) {
        throw new Error('Valid Bootstrap version required.\nPlease pass the Bootstrap version as an argument.');
    }

    // strip leading 'v' if present
    version = version.replace(/^v/, '');

    const basedir = path.join(__dirname, '..');
    const bootstrapSrcDir = path.join(basedir, 'node_modules/bootstrap/dist');
    const bootstrapDistDir = path.join(basedir, 'cdn', 'twitter-bootstrap', version);

    if (fs.existsSync(bootstrapDistDir)) {
        console.warn('Bootstrap version already found, exiting.');
        return;
    }

    fs.mkdirSync(bootstrapDistDir);

    fse.copySync(`${bootstrapSrcDir}`, `${bootstrapDistDir}`, {
        overwrite: false,
        errorOnExist: true,
        preserveTimestamps: true
    });
    console.log(`Successfully copied "${bootstrapSrcDir}" to "${bootstrapDistDir}"`);
    console.log(`\nDo not forget to update "${path.normalize('config/_config.yml')}"!`);
})();
