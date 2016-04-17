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