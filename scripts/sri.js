'use strict';

const path = require('path');

const { generateSri } = require(path.join(__dirname, '../lib/helpers'));

if (process.argv[1] === __filename) {
    for (let i = 2; i < process.argv.length; i++) {
        const file = process.argv[i];

        console.log(`${file}\n> ${generateSri(file)}`);
    }
} else {
    module.exports.generateSri = generateSri;
}
