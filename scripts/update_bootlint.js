#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

(() => {
    let version = process.argv[2];

    if (!version) {
        throw new Error('Valid Bootlint version required.\nPlease pass the Bootlint version as an argument.');
    }

    // strip leading 'v' if present
    version = version.replace(/^v/, '');

    const basedir = path.join(__dirname, '..');
    const bootlintSrcDir = path.join(basedir, 'node_modules/bootlint/dist/browser/');
    const bootlintDistDir = path.join(basedir, 'cdn', 'bootlint', version);

    if (fs.existsSync(bootlintDistDir)) {
        console.warn('Bootlint version already found, exiting.');
        return;
    }

    fs.mkdirSync(bootlintDistDir);

    try {
        fse.copySync(`${bootlintSrcDir}`, `${bootlintDistDir}`, {
            overwrite: false,
            errorOnExist: true,
            preserveTimestamps: true
        });
        console.log(`Successfully copied "${bootlintSrcDir}" to "${bootlintDistDir}"`);
        console.log(`\nDo not forget to update "${path.normalize('config/_config.yml')}"!`);
    } catch (error) {
        throw new Error(error);
    }
})();
