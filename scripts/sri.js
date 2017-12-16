'use strict';

const path   = require('path');

const digest = require(path.join(__dirname, '..', 'lib', 'helpers')).sri.digest;

if (process.argv[1] === __filename) {
    for (let i = 2; i < process.argv.length; i++) {
        const file = process.argv[i];

        console.log(file);
        console.log('>', digest(file));
    }
} else {
    module.exports.digest = digest;
}
