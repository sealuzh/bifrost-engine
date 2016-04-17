'use strict';

import path from 'path'
import _ from 'lodash'

import envDevelopment from './development'
import envProduction from './production'

var env = {
    production: envProduction,
    development: envDevelopment
};

// All configurations will extend these options
// ============================================
var all = {

    env: process.env.NODE_ENV,

    DOCKER_HOST: process.env.DOCKER_HOST || 'localhost',
    DOCKER_PORT: process.env.DOCKER_HOST || 2376,
    DOCKER_CA: process.env.DOCKER_CA,
    DOCKER_CERT: process.env.DOCKER_CERT,
    DOCKER_KEY: process.env.DOCKER_KEY,

    PROMETHEUS: process.env.PROMETHEUS || 'http://192.168.99.100:9090',

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    PROXY_API_PORT: process.env.PROXY_API_PORT || 9091, // TODO: CHANGE TO 9090

    // REST-API
    port: process.env.PORT || 9090,
    ip: process.env.IP || '0.0.0.0',

    // BiFrost-UI
    biFrost: {
        ui: 'http://localhost:9000'
    },

    logLevel: process.env.LOG_LEVEL || 'info'

};

// Export the config object based on the NODE_ENV
// ==============================================

export default _.merge(all, env[all.env] || {});