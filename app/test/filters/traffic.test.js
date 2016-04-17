import should from 'should';
import nock from 'nock';
import yamlLoader from '../utils/yamlLoader'
import Service from '../../components/dsl/models/service'
import config from '../../config/environment/index'

describe('Filter: Header', function () {

    var release = yamlLoader.load('actions/filter-traffic.yml');
    var filterTraffic = release.strategies[0].actions[0];

    var httpTraffic = filterTraffic.filters[0];

    var fromService = new Service();
    fromService.name = "serviceA";
    fromService.host = "serviceAHost";
    fromService.port = 80;

    var targetService = new Service();
    targetService.name = "serviceB";
    targetService.host = "serviceBHost";
    targetService.port = 80;

    var proxyConfig = {mapping: {"serviceAHost": "serviceA_proxy", "serviceBHost": "serviceB_proxy"}};

    before(function(done) {
        var proxyNock = nock('http://serviceA_proxy:' + config.PROXY_API_PORT);
        proxyNock.intercept('/api/v1/filters', 'POST').reply(201, {});
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, httpTraffic);
        proxyNock.intercept('/api/v1/filters', 'DELETE').reply(204, {});
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, httpTraffic);
        done();
    });

    it('should be properly inflated', function () {

        filterTraffic.constructor.name.should.be.equal('Route');
        fromService.constructor.name.should.be.equal('Service');
        targetService.constructor.name.should.be.equal('Service');

        // Test whether filters get properly inflated
        filterTraffic.filters.should.be.Array();
        filterTraffic.filters.should.have.length(1);
        httpTraffic.constructor.name.should.be.equal('Traffic');

    });

    it('should successfully create the filterOptions', async function () {
        var result = httpTraffic.constructFilterOptions(fromService, targetService);
        result.should.be.eql({
            sticky: false,
            traffic: 80,
            shadow: false,
            targetHost: "serviceBHost",
            targetPort: 80
        });
    });

    it('should successfully use intervals', async function () {
        var result = httpTraffic.constructFilterOptions(fromService, targetService, 2);
        result.should.be.eql({
            sticky: false,
            traffic: 100,
            shadow: false,
            targetHost: "serviceBHost",
            targetPort: 80
        });
    });

    it('should successfully shadow traffic', async function () {
        httpTraffic.shadow = true;
        var result = httpTraffic.constructFilterOptions(fromService, targetService, 2);
        result.should.be.eql({
            sticky: false,
            traffic: 100,
            shadow: true,
            targetHost: "serviceBHost",
            targetPort: 80
        });
    });

    it('should apply the filter', async function () {
        var result = await httpTraffic.apply(proxyConfig, fromService, targetService);
        result.should.be.eql(true);
    });

    it('should clear the filter', async function () {
        var result = await httpTraffic.clear(proxyConfig, fromService, targetService);
        result.should.be.eql(true);
    });

});