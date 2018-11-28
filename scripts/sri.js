'use strict';

const path    = require('path');

const helpers = require(path.resolve(__dirname, '../lib/helpers.js'));

const { digest }  = helpers.sri;

if (process.argv[1] === __filename) {
    for (let i = 2; i < process.argv.length; i++) {
        const file = process.argv[i];

        console.log(file);
        console.log('>', digest(file));
    }
} else {
    module.exports.digest = digest;
}
