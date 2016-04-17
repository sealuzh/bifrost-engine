import should from 'should';
import yamlLoader from '../../utils/yamlLoader'

describe('Action:', function () {

    describe('onTrue/onFalse', function () {

        var release = yamlLoader.load('actions/action.yml');
        var routeAction = release.strategies[0].actions[0];

        it('should inflate string to switch-action', async function () {
            routeAction.onTrue.constructor.name.should.be.equal('Switch');
            routeAction.onTrue.next.should.be.equal('serviceA');
            
            routeAction.onFalse.constructor.name.should.be.equal('Switch');
            routeAction.onFalse.next.should.be.equal('serviceB');
        });

    });

    describe('onTrue/onFalse', function () {

        var release = yamlLoader.load('actions/action_action.yml');
        var routeAction = release.strategies[0].actions[0];

        it('should inflate actions', async function () {
            routeAction.onTrue.constructor.name.should.be.equal('Route');
            routeAction.onTrue.from.should.be.equal("serviceA");
            routeAction.onTrue.to.should.be.equal("serviceB");

            routeAction.onFalse.constructor.name.should.be.equal('Route');
            routeAction.onFalse.from.should.be.equal("serviceA");
            routeAction.onFalse.to.should.be.equal("serviceB");
        });

    });

});