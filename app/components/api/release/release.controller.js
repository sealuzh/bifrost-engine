'use strict';

import async from 'async'
import request from 'request-promise'
import config from '../../../config/environment'
import engine from '../../dsl/engine/engine'
import Interpreter from '../../dsl/interpreter/interpreter'
import log from '../../log/log'

var exports = {};

/**
 * Get list of running release
 */
exports.index = async function (req, res) {
    var list = await engine.list();
    res.status(200).send(list);
};

/**
 * Get list of running release
 */
exports.get = async function (req, res) {
    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({err: 'no release found'});
    }

    return res.status(200).send(release);
};

/**
 * Start a already existing release that isn't running.
 * @param req
 * @param res
 * @returns {*}
 */
exports.start = async function (req, res) {
    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({err: 'no release found'});
    }

    if (release.isFinished) {
        return res.status(500).send({err: 'release is already finished.'});
    }

    engine.start(release);

    return res.status(200).send(release);
};

/**
 * Get list of running release
 */
exports.reset = async function (req, res) {
    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({err: 'no release found'});
    }

    release.reset();
    release.broadcastUpdate();

    return res.status(200).send(release);
};

/**
 * submit a new release
 */
exports.create = async function (req, res, next) {

    let release = req.body;
    let interpreter = new Interpreter();

    // check the release for validity
    try {
        interpreter.parse(release);
    } catch (err) {
        if (err) return res.status(400).send(err);
    }

    // release was okay, store
    release = engine.queue(release);

    release._startedAt = new Date().toISOString();
    release._isRunning = true;

    return res.status(200).send(release);

};

/**
 * Delete an existing, non-running release
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (req, res, next) {

};

exports.clearProxies = async function (req, res, next) {
    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({err: `no release with id ${id}`});
    }

    var requests = [];


    release.deployment.services.forEach(service => {
        requests.push(async function (callback) {
            log.debug(`asking ${service.host}`);

            var proxyHost = release.deployment.getProxyConfig().mapping[service.host];

            try {
                var result = await request({
                    method: 'DELETE',
                    uri: `http://${proxyHost}:${config.PROXY_API_PORT}/api/v1/filters`,
                    simple: false,
                    resolveWithFullResponse: true,
                    json: true,
                    timeout: 1000
                });
                service.filters = result.body;
                log.debug(`got result from ${service.host}`);
                callback(null, service);
            } catch (err) {
                log.warn(err);
                callback(err);
            }
        });
    });

};

exports.proxies = async function (req, res, next) {
    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({err: `no release with id ${id}`});
    }

    var requests = [];

    release.deployment.services.forEach(service => {
        var proxyHost = release.deployment.getProxyConfig().mapping[service.host];

        if (proxyHost) {
            requests.push(async function (callback) {
                log.debug(`asking ${service.host}`);

                try {
                    var result = await request({
                        uri: `http://${proxyHost}:${config.PROXY_API_PORT}/api/v1/filters`,
                        simple: false,
                        resolveWithFullResponse: true,
                        json: true,
                        timeout: 1000
                    });
                    service.filters = result.body;
                    log.debug(`got result from ${service.host}`);
                    callback(null, service);
                } catch (err) {
                    log.warn(err);
                    callback(err);
                }
            });
        }
    });

    async.parallel(requests, function (err, results) {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });

};

export default exports;
