'use strict';
var path   = require('path');
var digest = require(path.join(__dirname, '..', 'lib', 'helpers')).sri.digest;

function digest(file) {
}

if (process.argv[1] == __filename) {
    for (var i = 2; i < process.argv.length; i++) {
        var file = process.argv[i];
        console.log(file);
        console.log('>', digest(file));
    }
} else {
    module.exports.digest = digest;
}
