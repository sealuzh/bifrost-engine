import should from 'should'
import restAPI from '../../components/api/'
import request from 'request-promise'
import http from 'http';
import Engine from '../../components/dsl/engine/engine'
import yamlLoader from '../utils/yamlLoader'
import config from '../../config/environment/index'
import nock from 'nock'

describe('API: Releases', function () {

    var server = http.createServer(restAPI);
    var release;
    var releaseJSON;

    before(function (done) {
        nock(config.PROMETHEUS).filteringPath(function (path) {
            return '/';
        }).get('/').times(10).reply(200, {data: {result: [{value: [1455199123.94,"1350.75"]}]}});

        server.listen(9090, "127.0.0.1", function () {
            done();
        });
    });

    beforeEach(async function (done) {
        releaseJSON = yamlLoader.loadJSON('strategies.yml');
        release = await Engine.queue(releaseJSON);
        done();
    });

    it('/GET releases should list all releases', async function () {
        var response = await request({
            method: 'GET',
            uri: 'http://localhost:9090/api/v1/releases',
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });

        response.statusCode.should.be.equal(200);
        response.body.should.be.a.Array();
        response.body.should.be.lengthOf(1);

        var responseRelease = response.body[0];

        // check if engine gave it an ID
        responseRelease.should.have.property('_id');
        responseRelease.should.have.property('deployment');
        responseRelease.should.have.property('strategies');
        responseRelease.strategies.should.be.lengthOf(release.strategies.length);

        // default properties
        var healthCheck = responseRelease.strategies[0];

        // check for property on strategy
        healthCheck.name.should.be.equal('health_check');

        // check whether strategy has actions
        healthCheck.actions.should.be.an.Array();
        healthCheck.actions.should.be.lengthOf(release.strategies[0].actions.length);

        var metricAction = healthCheck.actions[0];
        metricAction.name.should.be.equal('Metric');
        metricAction.providers.should.be.an.Array();
        metricAction.validator.should.be.equal('<0.02');

    });

    it('/GET/:id should return a specific release', async function () {
        var response = await request({
            method: 'GET',
            uri: 'http://localhost:9090/api/v1/releases/' + release._id,
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });

        response.statusCode.should.be.equal(200);
        var responseRelease = response.body;

        responseRelease.should.be.an.Object();

        // should have gotten an id
        responseRelease.should.have.property('_id');

        // check if engine gave it an ID
        responseRelease.should.have.property('_id');
        responseRelease.should.have.property('deployment');
        responseRelease.should.have.property('strategies');
        responseRelease.strategies.should.be.lengthOf(release.strategies.length);

        // default properties
        var healthCheck = responseRelease.strategies[0];

        // check for property on strategy
        healthCheck.name.should.be.equal('health_check');

        // check whether strategy has actions
        healthCheck.actions.should.be.an.Array();
        healthCheck.actions.should.be.lengthOf(release.strategies[0].actions.length);

        var metricAction = healthCheck.actions[0];
        metricAction.name.should.be.equal('Metric');
        metricAction.providers.should.be.an.Array();
        metricAction.validator.should.be.equal('<0.02');

    });

    it('/GET/:id reflect updates properly', async function () {
        var updatedRelease = await Engine.get(release._id);

        updatedRelease._startedAt = new Date();
        updatedRelease._finishedAt = new Date();
        updatedRelease._failedAt = new Date();

        updatedRelease.strategies[0]._startedAt = new Date();
        updatedRelease.strategies[0]._finishedAt = new Date();
        updatedRelease.strategies[0]._failedAt = new Date();

        updatedRelease.strategies[0].actions[0]._startedAt = new Date();
        updatedRelease.strategies[0].actions[0]._finishedAt = new Date();
        updatedRelease.strategies[0].actions[0]._failedAt = new Date();

        await Engine.update(updatedRelease);

        var response = await request({
            method: 'GET',
            uri: 'http://localhost:9090/api/v1/releases/' + updatedRelease._id,
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });

        response.statusCode.should.be.equal(200);
        response.body.should.be.an.Object();

        var responseRelease = response.body;

        // check if release-properties have been updated
        responseRelease.should.have.property('_startedAt');
        responseRelease.should.have.property('_finishedAt');
        responseRelease.should.have.property('_failedAt');

        responseRelease._startedAt.should.equal(updatedRelease._startedAt.toISOString());
        responseRelease._finishedAt.should.equal(updatedRelease._finishedAt.toISOString());
        responseRelease._failedAt.should.equal(updatedRelease._failedAt.toISOString());

        responseRelease.strategies[0].should.have.property('_startedAt');
        responseRelease.strategies[0].should.have.property('_finishedAt');
        responseRelease.strategies[0].should.have.property('_failedAt');

        responseRelease.strategies[0]._startedAt.should.equal(updatedRelease.strategies[0]._startedAt.toISOString());
        responseRelease.strategies[0]._finishedAt.should.equal(updatedRelease.strategies[0]._finishedAt.toISOString());
        responseRelease.strategies[0]._failedAt.should.equal(updatedRelease.strategies[0]._failedAt.toISOString());

        responseRelease.strategies[0].actions[0].should.have.property('_startedAt');
        responseRelease.strategies[0].actions[0].should.have.property('_finishedAt');
        responseRelease.strategies[0].actions[0].should.have.property('_failedAt');

        responseRelease.strategies[0].actions[0]._startedAt.should.equal(updatedRelease.strategies[0].actions[0]._startedAt.toISOString());
        responseRelease.strategies[0].actions[0]._finishedAt.should.equal(updatedRelease.strategies[0].actions[0]._finishedAt.toISOString());
        responseRelease.strategies[0].actions[0]._failedAt.should.equal(updatedRelease.strategies[0].actions[0]._failedAt.toISOString());
    });

    it('/GET/:id reflect updates properly', async function () {
        var updatedRelease = await Engine.get(release._id);

        await Engine.start(updatedRelease);

        var response = await request({
            method: 'GET',
            uri: 'http://localhost:9090/api/v1/releases/' + updatedRelease._id,
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });

        response.statusCode.should.be.equal(200);
        response.body.should.be.an.Object();

        var responseRelease = response.body;

        responseRelease.should.have.property('_startedAt');
        responseRelease.strategies[0].should.have.property('_startedAt');
        responseRelease.strategies[0].actions[0].should.have.property('_startedAt');
    });

    afterEach(async function (done) {
        await Engine.clean();
        done();
    });

    after(function (done) {
        nock.cleanAll();
        server.close();
        done();
    });

});