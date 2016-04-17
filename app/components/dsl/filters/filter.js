import request from 'request-promise'
import log from '../../log/log'
import socketUpdater from '../progress/socket-updater'
import config from '../../../config/environment/'

export default class Filter {

    constructor() {

    }

    /**
     * Applies the Filter to the Service
     * @param {Service}
     * @param {Service}
     * @returns {boolean}
     */
    async apply(proxyConfig, serviceFrom, serviceTo, intervals) {

        log.info({action: this}, `Apply Filter: [${serviceFrom.name}]-proxy`);

        var body = this.constructFilterOptions(serviceFrom, serviceTo, intervals);
        var uri = 'http://' + proxyConfig.mapping[serviceFrom.host] + ':' + config.PROXY_API_PORT + '/api/v1/filters';

        var response = await request({
            method: 'POST',
            uri: uri,
            simple: false,
            resolveWithFullResponse: true,
            json: true,
            body: body
        });

        log.info({action: this}, `[${serviceFrom.name}] updated, received ${response.statusCode}`);

        var allFilters = await request({
            method: 'GET',
            uri: 'http://' + proxyConfig.mapping[serviceFrom.host] + ':' + config.PROXY_API_PORT + '/api/v1/filters',
            json: true
        });

        socketUpdater.broadcast('proxy:update', {id: serviceFrom.id, name: serviceFrom.name, host: serviceFrom.host, ports: serviceFrom.port, filters: allFilters});

        return response.statusCode === 201; // return true if applying filter was successful
    }

    /**
     * Clears the Filter from the Service
     * @param serviceFrom
     * @param serviceTo
     * @returns {boolean}
     */
    async clear(proxyConfig, serviceFrom, serviceTo) {

        log.info({action: this}, `Clear Filter: [${serviceFrom.name}]-proxy`);

        var response = await request({
            method: 'DELETE',
            uri: 'http://' + proxyConfig.mapping[serviceFrom.host] + ':' + config.PROXY_API_PORT + '/api/v1/filters',
            simple: false,
            resolveWithFullResponse: true,
            json: true,
            body: this.constructFilterOptions(serviceFrom, serviceTo)
        });

        log.info({action: this}, `[${serviceFrom.name}] updated, received ${response.statusCode}`);

        var allFilters = await request({
            method: 'GET',
            uri: 'http://' + proxyConfig.mapping[serviceFrom.host] + ':' + config.PROXY_API_PORT + '/api/v1/filters',
            json: true
        });

        socketUpdater.broadcast('proxy:update', {id: serviceFrom.id, name: serviceFrom.name, host: serviceFrom.host, ports: serviceFrom.port, filters: allFilters});

        return response.statusCode === 204; // return true if applying filter was successful
    }

    /**
     * Empty Implementation
     * @param serviceTo
     * @returns {{}}
     */
    constructFilterOptions(serviceFrom, serviceTo, intervals) {
        return {}
    }

}