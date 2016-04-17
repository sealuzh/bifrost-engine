'use strict';

import 'source-map-support/register'
import bunyan from 'bunyan'
import Stream from 'stream'
import chalk from 'chalk'
import Promise from 'bluebird'
import config from '../../config/environment/index'
import socketUpdater from '../dsl/progress/socket-updater'

// Disable Warnings (produced by Babel Transpiler)
Promise.config({warnings: false});

// Bunyan Logger
var log;
var ongoingOperation = false;

// Custom Pretty-Print Stream
var stream = new Stream();
stream.writable = true;

stream.write = function (obj) {

    var logString = '';

    if (obj.err) {
        console.log(obj.err);
    }

    if (obj.level < 30) {
        logString += `[${chalk.white(obj.time.toTimeString().substr(0, 8))}]`;
    } else {
        logString += `[${chalk.grey(obj.time.toTimeString().substr(0, 8))}]`;
    }

    logString += ` [${chalk.blue('bifrost')}] `;

    if (obj.strategy) {
        logString += `[${chalk.yellow(obj.strategy.name)}] `;
    }

    if (obj.action) {
        logString += `[${chalk.green(obj.action.constructor.name)}] `;
    }

    logString += `${obj.msg}`;

    socketUpdater.broadcast('release:log', logString);

    // this is an ongoing operation...
    if (obj.msg.indexOf('...') > -1) {
        ongoingOperation = true;
        process.stdout.write(logString);
    } else if (ongoingOperation) {
        ongoingOperation = false;
        process.stdout.write(` ${obj.msg}`);
        console.log();
    } else {
        console.log(logString);
    }

}

var defaultConfig = {
    name: "engine",
    level: config.logLevel,
    streams: [
        {
            type: "raw",
            stream: stream
        }
    ]
};

function createLogger() {

    if (log) {
        return log;
    }

    log = bunyan.createLogger(defaultConfig);

    return log;

}

export default createLogger();