import should from 'should'
import restAPI from '../../components/api/'
import request from 'request-promise'
import http from 'http';
import Engine from '../../components/dsl/engine/engine'
import yamlLoader from '../utils/yamlLoader'

describe('API: Proxies', function () {

    var server = http.createServer(restAPI);
    var release;
    var releaseJSON;

    before(function (done) {
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

        // check if engine gave it an ID
        response.body[0].should.have.property('_id');

        // check if all properties have been saved
        releaseJSON._id = response.body[0]._id;
        response.body[0].should.be.deepEqual(releaseJSON);
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
        response.body.should.be.an.Object();

        // should have gotten an id
        response.body.should.have.property('_id');

        // check if engine gave it an ID
        releaseJSON._id = response.body._id;
        response.body.should.be.deepEqual(releaseJSON);
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

        // check if release-properties have been updated
        response.body.should.have.property('_startedAt');
        response.body.should.have.property('_finishedAt');
        response.body.should.have.property('_failedAt');

        response.body._startedAt.should.equal(updatedRelease._startedAt.toISOString());
        response.body._finishedAt.should.equal(updatedRelease._finishedAt.toISOString());
        response.body._failedAt.should.equal(updatedRelease._failedAt.toISOString());

        response.body.strategies[0].should.have.property('_startedAt');
        response.body.strategies[0].should.have.property('_finishedAt');
        response.body.strategies[0].should.have.property('_failedAt');

        response.body.strategies[0]._startedAt.should.equal(updatedRelease.strategies[0]._startedAt.toISOString());
        response.body.strategies[0]._finishedAt.should.equal(updatedRelease.strategies[0]._finishedAt.toISOString());
        response.body.strategies[0]._failedAt.should.equal(updatedRelease.strategies[0]._failedAt.toISOString());

        response.body.strategies[0].actions[0]._startedAt.should.equal(updatedRelease.strategies[0].actions[0]._startedAt.toISOString());
        response.body.strategies[0].actions[0]._finishedAt.should.equal(updatedRelease.strategies[0].actions[0]._finishedAt.toISOString());
        response.body.strategies[0].actions[0]._failedAt.should.equal(updatedRelease.strategies[0].actions[0]._failedAt.toISOString());
    });

    afterEach(async function (done) {
        await Engine.clean();
        done();
    });

    after(function (done) {
        server.close();
        done();
    });

});