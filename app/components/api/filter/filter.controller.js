'use strict';

import log from '../../log/log'
import async from 'async'
import request from 'request-promise'
import config from '../../../config/environment'
import engine from '../../dsl/engine/engine'

var exports = {};

/**
 * Asks each corresponding proxy of a service about its current routing/filters
 * @param req
 * @param res
 */
exports.index = async function (req, res) {

    var release = await engine.get(req.params.id);

    if (!release) {
        return res.status(404).send({});
    }

    var requests = [];

    release.deployment.services.forEach(service => {
        requests.push(async function (callback) {

            log.info(`asking ${service.host}`);
            var proxyHost = release.deployment.getProxyConfig().mapping[service.host];
            log.info(`proxy is ${proxyHost}`);

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
                log.info(err);
                callback(err);
            }
        });
    });

    async.parallel(requests, function (err, results) {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });

};

exports.get = function (req, res) {
    return res.status(200).send({});
};

export default exports;
