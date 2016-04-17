import yamlLoader from '../../utils/yamlLoader'
import nock from 'nock';
import config from '../../../config/environment/index'

describe('Action: Route', function () {

    var release = yamlLoader.load('actions/route.yml');
    var strategy = release.strategies[0];
    var routeAction = strategy.actions[0];

    before(function(done) {
        var proxyNock = nock('http://serviceA_proxy:' + config.PROXY_API_PORT);
        proxyNock.intercept('/api/v1/filters', 'POST').reply(201, {});
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, {});
        proxyNock.intercept('/api/v1/filters', 'DELETE').reply(204, {});
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, {});
        proxyNock.intercept('/api/v1/filters', 'DELETE').reply(204, {});
        proxyNock.intercept('/api/v1/filters', 'GET').reply(200, {});
        done();
    });

    it('should be properly inflated', async function () {
        routeAction.constructor.name.should.be.equal('Route');
        routeAction.from.should.be.equal('serviceA');
        routeAction.to.should.be.equal('serviceB');
    });

    it('should be properly evaluated', async function () {
        var result = await routeAction.execute(strategy, release);
        result.should.be.true;
    });

    it('should be properly cleared', async function () {
        var result = await routeAction.postEvaluate(strategy, release);
        result.should.be.true;

        routeAction.persistance = true;
        result = await routeAction.postEvaluate(strategy, release);
        result.should.be.true;
    });

});