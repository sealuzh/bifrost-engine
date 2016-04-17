"use strict";

import 'babel-polyfill'

import config from './config/environment'
import http from 'http'
import socketio from 'socket.io'
import socketHandler from './components/dsl/progress/socket-updater'
import restAPI from './components/api/index'
import log from './components/log/log'
import process from 'process'

// async exception-catcher
process.on('unhandledRejection', function (reason, p) {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

// Start REST-API and Socket.IO Server
var server = http.createServer(restAPI);
var io = socketio(server);

socketHandler.setup(io);

server.listen(config.port, config.ip, function () {
    log.info('Bifrost Engine listening on %d, in %s mode', config.port, restAPI.get('env'));
});
