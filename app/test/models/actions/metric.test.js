import should from 'should';
import nock from 'nock';
import yamlLoader from '../../utils/yamlLoader'

describe('Action: Metric', function () {

    describe('comparisonCheck', function () {

        var release = yamlLoader.load('actions/comparison.yml');
        var strategy = release.strategies[0];
        var metricAction = release.strategies[0].actions[0];
        var prometheusProvider = metricAction.providers[0];

        before(function (done) {

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.94,"1350.75"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.944,"2282.8333333333335"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.94,"1350.75"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.944,"2282.8333333333335"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.94,"1350.75"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.944,"2282.8333333333335"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.94,"1350.75"]}]}});

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(1).reply(200, {data: {result: [{value: [1455199123.944,"2282.8333333333335"]}]}});

            nock('http://testService').post('/').times(1).reply(200, {});

            done();

        });

        it('should evaluate >= successfully', async function () {

            metricAction.validator = "serviceAQuery>=serviceBQuery";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

            metricAction.validator = "serviceAQuery>serviceBQuery";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

            metricAction.validator = "serviceAQuery<=serviceBQuery";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = "serviceAQuery<serviceBQuery";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

        });

    });

    describe('simpleCheck', function () {

        var release = yamlLoader.load('actions/metric.yml');
        var strategy = release.strategies[0];
        var metricAction = release.strategies[0].actions[0];
        var prometheusProvider = metricAction.providers[0];

        before(function (done) {

            nock(prometheusProvider.prometheusUrl).filteringPath(function (path) {
                return '/';
            }).get('/').times(15).reply(200, {data: {result: [{value: [1, 2]}]}});

            done();
        });

        it('should evaluate > successfully', async function () {

            metricAction.validator = ">2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

            metricAction.validator = ">1";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

        });

        it('should evaluate < successfully', async function () {

            metricAction.validator = "<2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

            metricAction.validator = "<3";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

        });

        it('should evaluate <= / >= successfully', async function () {

            metricAction.validator = "<=2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = "<=3";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = ">=2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = ">=1";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

        });

        it('should evaluate = successfully', async function () {

            metricAction.validator = "=2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = "=2.1";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

        });

        it('should evaluate != successfully', async function () {

            metricAction.validator = "!=3";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

            metricAction.validator = "!=2";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(false);

        });

        it('should evaluate http: successfully', async function () {

            metricAction.validator = "http://testService";
            var result = await metricAction.evaluate(strategy, release);
            result.should.be.equal(true);

        });

        after(function (done) {
            nock.cleanAll();
            done();
        });

    });

})