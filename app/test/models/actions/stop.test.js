import yamlLoader from '../../utils/yamlLoader'

describe('Action: Stop', function () {

    var release = yamlLoader.load('actions/stop.yml');
    var stopAction = release.strategies[0].actions[0];

    it('should be properly inflated', async function () {
        stopAction.constructor.name.should.be.equal('Stop');
    });

});