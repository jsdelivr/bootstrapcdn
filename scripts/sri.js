'use strict';
var exec = require('child_process').execSync;

function digest(file) {
    return 'sha256-' +
        exec('cat '  + file + ' | openssl dgst -sha256 -binary | openssl enc -base64 -A').toString()  +
        ' sha512-'   +
        exec('cat '  + file + ' | openssl dgst -sha512 -binary | openssl enc -base64 -A').toString();
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
