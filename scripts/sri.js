'use strict';

const { generateSri } = require('../lib/helpers');

for (let i = 2; i < process.argv.length; i++) {
    const file = process.argv[i];

    console.log(`${file}\n> ${generateSri(file)}`);
}
