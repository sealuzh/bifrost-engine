import should from 'should';
import nock from 'nock';
import yamlLoader from '../../../utils/yamlLoader'

describe('MetricsProvider: Prometheus', function () {

    var release = yamlLoader.load('actions/metric.yml');
    var strategy = release.strategies[0];
    var metricAction = release.strategies[0].actions[0];
    var prometheusProvider = metricAction.providers[0];

    before(function (done) {
        nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
            return '/';
        }).get('/').reply(200, {data: {result: [{value: [1, 2]}]}});
        done();
    });

    it('should properly inflate prometheus-metric', function () {
        prometheusProvider.constructor.name.should.equal('Prometheus');
    });

    it('should properly query the api using evaluate', async function () {
        var result = await prometheusProvider.evaluate(strategy, release);
        (result == {name: 'prometheus', metric: 2}).should.be.ok;
    });

    after(function (done) {
        nock.cleanAll();
        done();
    });
});