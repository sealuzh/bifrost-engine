import yamlLoader from '../utils/yamlLoader'
import Engine from '../../components/dsl/engine/engine'
import Storage from '../../components/storage/storage'

describe('Engine', function () {

    var releaseId;

    before(function (done) {
        var release = yamlLoader.loadJSON('strategies.yml');

        Storage.releases.remove({}, {multi: true}, function (err, numRemoved) {
            if (err) console.log(err);
            Storage.releases.insert(release, function (err, doc) {
                releaseId = doc._id;
                if (err) console.log(err);
                done();
            });
        });
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
        var release = await Engine.queue(yamlLoader.loadJSON('strategies2.yml'));
        var previousRelease = await Engine.get(release._id);

        // set startedAt date
        previousRelease._startedAt = new Date();
        previousRelease.strategies[0]._startedAt = new Date();
        previousRelease.strategies[0].actions[1]._startedAt = new Date();

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

});