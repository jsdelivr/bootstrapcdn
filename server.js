'use strict';

/**
 * Libraries
 **/
var cluster = require('cluster');
var datefmt = require('dateformat');

/**
 * Setup
 **/
var workers = parseInt(process.env.CLUSTER_WORKERS||4, 10);

cluster.setupMaster({exec : "app.js"});

/**
 * Utilities
 **/
var restartCount = 0;

function say(message) {
    console.log("[SERVER] " + message);
}

function checkRestart() {
    if (restartCount >= 8) {
        say("FATAL: Too many restarts in too short a time.");
        process.exit(1);
    }
    restartCount = 0;
}
setInterval(checkRestart, 2000);

/**
 * Startup Messaging
 **/
say("Master starting:");
say("time        => " + datefmt(new Date(), "ddd, dd mmm yyyy hh:MM:ss Z"));
say("pid         => " + process.pid);
say("environment => " + process.env.NODE_ENV);

/**
 * Fork Workers
 **/
say("Workers starting:");

for (var i = 0; i < workers; i += 1) {
    cluster.fork();
}

/**
 * Worker Event Handlers
 **/
cluster.on('exit', function (worker) {
    say('worker      => with pid: ' +
        worker.process.pid +
        ', died. Restarting...');
    restartCount++;
    cluster.fork();
});

cluster.on('online', function (worker) {
    say('worker      => start with pid: ' + worker.process.pid + '.');
});
// vim: ft=javascript sw=4 sts=4 et:
