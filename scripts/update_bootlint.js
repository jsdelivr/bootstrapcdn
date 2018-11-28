#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const uglifyjs = require('uglify-js');

let version = process.argv[2];

if (!version) {
    console.log('Valid Bootlint version required.');
    process.exit(1);
}

// strip leading 'v' if present
version = version.replace(/^v/, '');

const basedir = path.join(__dirname, '..');
const bootlintSrcDir = path.join(basedir, 'node_modules/bootlint/dist/browser/');
const bootlintDistDir = path.join(basedir, 'cdn', 'bootlint', version);

if (fs.existsSync(bootlintDistDir)) {
    console.log('Bootlint version already found.');
    process.exit(1);
}

fs.mkdirSync(bootlintDistDir);
fs.copyFileSync(`${bootlintSrcDir}/bootlint.js`, `${bootlintDistDir}/bootlint.js`);

function runUglify() {
    const targetFile = 'bootlint.js';
    const targetMinFile = `${targetFile.substr(0, targetFile.length - 3)}.min${targetFile.substr(targetFile.lastIndexOf('.'))}`;
    const targetSourceMapFile = `${targetMinFile}.map`;

    const targetFilepath = path.join(bootlintDistDir, targetFile);
    const targetMinFilepath = path.join(bootlintDistDir, targetMinFile);

    const uglifyOptions = {
        // compress and mangle are on by default
        output: {
            comments: /(?:^!|@(?:license|preserve|cc_on))/
        },
        sourceMap: {
            filename: targetSourceMapFile,
            // includeSources: true,
            url: targetSourceMapFile
        }
    };
    const code = fs.readFileSync(targetFilepath, 'utf-8');
    const result = uglifyjs.minify(code, uglifyOptions);

    if (result.error) {
        console.log(result.error);
        process.exit(1);
    }

    fs.writeFileSync(targetMinFilepath, result.code);
    fs.writeFileSync(path.join(bootlintDistDir, targetSourceMapFile), result.map);
}

runUglify();

console.log(`\nDo not forget to update "${path.normalize('config/_config.yml')}"!`);
