import yamlLoader from '../../utils/yamlLoader'
import nock from 'nock';
import config from '../../../config/environment/index'

describe('Action: Request', function () {

    var release = yamlLoader.load('actions/request.yml');
    var strategy = release.strategies[0];
    var defaultRequest = strategy.actions[0];
    var timedRequest = strategy.actions[1];
    var timedThresholdReached = strategy.actions[2];
    var timedThresholdNotReached = strategy.actions[3];

    before(function(done) {
        var proxyNock = nock('http://request');
        proxyNock.intercept('/default', 'GET').reply(200, {});
        proxyNock.intercept('/timed', 'GET').reply(200, {});
        proxyNock.intercept('/timed', 'GET').reply(200, {});
        proxyNock.intercept('/timed', 'GET').reply(200, {});
        proxyNock.intercept('/timedThresholdReached', 'GET').reply(200, {});
        proxyNock.intercept('/timedThresholdReached', 'GET').reply(200, {});
        proxyNock.intercept('/timedThresholdNotReached', 'GET').reply(200, {});
        proxyNock.intercept('/timedThresholdNotReached', 'GET').reply(500, {});
        done();
    });

    it('should be properly inflated', async function () {
        defaultRequest.constructor.name.should.be.equal('Request');
        defaultRequest.url.should.be.equal('http://request/default');
        defaultRequest.status.should.be.equal(200);
    });

    it('should be properly evaluated', async function () {
        var result = await defaultRequest.execute(strategy, release);
        result.should.be.true;
    });

    it('should be properly evaluted using timedExecution', async function () {
        var result = await timedRequest.execute(strategy, release);
        result.should.be.true;
    });

    it('should be properly evaluted using timedExecution', async function () {
        var result = await timedThresholdReached.execute(strategy, release);
        result.should.be.true;
    });

    it('should be properly evaluted using timedExecution', async function () {
        var result = await timedThresholdNotReached.execute(strategy, release);
        result.should.be.false;
    });

});