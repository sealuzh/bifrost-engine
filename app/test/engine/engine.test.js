import yamlLoader from '../utils/yamlLoader'
import Engine from '../../components/dsl/engine/engine'
import Storage from '../../components/storage/storage'

describe('Engine', function () {

    var releaseId, release, releaseJSON;

    beforeEach(async function (done) {
        await Engine.clean();
        releaseJSON = yamlLoader.loadJSON('strategies.yml');
        release = await Engine.queue(releaseJSON);
        releaseId = release._id;
        done();
    });

    it('should list releases', async function () {
        var releases = await Engine.list();
        releases.should.be.Array();
        releases.should.have.lengthOf(1);
    });

    it('should insert a new release', async function () {
        var release = await Engine.queue(yamlLoader.loadJSON('strategies2.yml'));
        release.constructor.name.should.be.equal('Release');
        release.should.have.property('_id');

        // make sure strategies are attached
        release.strategies.should.have.lengthOf(3);

        // make sure strategies get properly serialized
        var strategy = release.strategies[0];
        strategy.should.have.property('name');
        strategy.name.should.be.equal('health_check');
        strategy.actions.should.have.lengthOf(2);
    });

    it('should update a existing release', async function () {
        var release = await Engine.queue(yamlLoader.loadJSON('strategies_and.yml'));
        var previousRelease = await Engine.get(release._id);

        // set startedAt date
        previousRelease._startedAt = new Date();
        previousRelease.strategies[0]._startedAt = new Date();
        previousRelease.strategies[0].actions[0]._startedAt = new Date();
        previousRelease.strategies[0].actions[0].actions[0]._startedAt = new Date();

        var updatedRelease = await Engine.update(previousRelease);
        previousRelease.should.be.deepEqual(updatedRelease);
    });

    it('should query a release', async function () {
        var release = await Engine.get(releaseId);
        release.constructor.name.should.be.equal('Release');
        release._id.should.be.equal(releaseId);
    });

    it('should verify a release', async function () {
        var release = Engine.dry(yamlLoader.loadJSON('strategies2.yml'));
        release.constructor.name.should.be.equal('Release');
    });

    it('should correctly start a release', async function () {
        var release = await Engine.queue(yamlLoader.loadJSON('strategies2.yml'));
        await Engine.start(release);
        release.should.have.property('_startedAt');
    });

    afterEach(async function (done) {
        await Engine.clean();
        done();
    });

});