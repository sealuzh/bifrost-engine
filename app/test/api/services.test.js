import should from 'should'
import nock from 'nock'
import restAPI from '../../components/api/'
import request from 'request-promise'
import http from 'http';
import engine from '../../components/dsl/engine/engine'
import config from '../../config/environment/index'

describe('API: Proxies', function () {

    var serviceAConfig = {name: 'A', port: '80', host: 'serviceA'};
    var serviceBConfig = {name: 'B', port: '80', host: 'serviceB'};
    var serviceCConfig = {name: 'C', port: '80', host: 'serviceC'};

    var server = http.createServer(restAPI);

    var aResults = {host: 'serviceA', name: 'A', port: '80', filters: []};
    var bFilters = [{from: 'test', to: 'test2'}];
    var bResults = {host: 'serviceB', name: 'B', port: '80', filters: bFilters};
    var cResults = {host: 'serviceC', name: 'C', port: '80', filters: []};

    before(function (done) {

        // mock serviceA-API
        var proxyNock = nock('http://serviceA_proxy:' + config.PROXY_API_PORT);
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, []);

        var proxyNockB = nock('http://serviceB_proxy:' + config.PROXY_API_PORT);
        proxyNockB.intercept('/api/v1/filters', 'GET').reply(200, bFilters);

        // push release with id 1
        engine.queue({
            _id: 'e6a15300-d0ad-11e5-8ff4-4185d077faa4',
            deployment: {
                services: [serviceAConfig, serviceBConfig, serviceCConfig],
                orchestrator: {
                    proxy: {mapping: {serviceA: 'serviceA_proxy', serviceB: 'serviceB_proxy'}}
                }
            }
        });

        server.listen(9090, "127.0.0.1", function () {
            done();
        });

    });

    it('should successfully retrieve proxy-configuration from requested services', async function () {
        var response = await request({
            method: 'GET',
            uri: 'http://localhost:9090/api/v1/releases/e6a15300-d0ad-11e5-8ff4-4185d077faa4/proxies',
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });

        response.statusCode.should.be.equal(200);
        response.body.should.be.a.Array();
        response.body.should.containDeep([aResults, bResults]);
    });

    after(function (done) {
        nock.cleanAll();
        server.close();
        done();
    });

});