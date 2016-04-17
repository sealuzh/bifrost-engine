import yamlLoader from '../../utils/yamlLoader'
import nock from 'nock';

describe('Action: Switch', function () {

    var release, strategySwitch, strategyA, strategyB, strategyRollback, actionSwitch, actionRollback;

    beforeEach(function (done) {
        release = yamlLoader.load('actions/switch.yml');
        strategySwitch = release.strategies[0];
        strategyA = release.strategies[1];
        strategyB = release.strategies[2];
        strategyRollback = release.strategies[3];
        actionSwitch = strategySwitch.actions[0];
        actionRollback = strategyRollback.actions[0];
        done();
    });

    it('should be properly inflated', async function () {
        actionSwitch.constructor.name.should.be.equal('Switch');
        actionSwitch.next.should.be.equal('A');
    });

    it('should properly switch the next strategy', async function () {
        release.getActiveStrategy().should.be.equal(strategySwitch);
        var result = await actionSwitch.execute(strategySwitch, release);
        result.should.be.true;
        release.nextStrategy();
        release.getActiveStrategy().should.be.equal(strategyA);

        actionSwitch.next = "B";
        var result = await actionSwitch.execute(strategySwitch, release);
        result.should.be.true;
        release.nextStrategy();
        release.getActiveStrategy().should.be.equal(strategyB);
    });

    it('should properly rollback the release', async function () {
        release.isFinished.should.be.false;
        var result = await actionRollback.execute(strategyRollback, release);
        result.should.be.true;
        release.nextStrategy();
        release.isFinished.should.be.true;
    });

});