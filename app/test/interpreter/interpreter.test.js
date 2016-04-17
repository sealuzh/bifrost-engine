import should from 'should';
import yamlLoader from '../utils/yamlLoader'

describe('Interpreter', function () {
    describe('#parse()', function () {

        var release = yamlLoader.load('deployment.yml');

        it('should properly inflate deployments', function () {
            release.should.have.property('deployment');
            release.deployment.constructor.name.should.be.equal('Deployment');
        });

        it('should properly inflate services in a given deployment', function () {
            release.deployment.should.have.property('services').with.lengthOf(2);
            release.deployment.services[0].constructor.name.should.be.equal('Service');
        });

        it('should properly assign the services configuration', function () {
            release.deployment.services[0].should.have.property('name').equal('nginx service a');
            release.deployment.services[0].should.have.property('host').equal('serviceA');
            release.deployment.services[0].should.have.property('port').eql(80);
            release.deployment.services[1].should.have.property('name').equal('nginx service b');
            release.deployment.services[1].should.have.property('host').equal('serviceB');
            release.deployment.services[1].should.have.property('port').eql(80);
        });

        var strategiesRelease = yamlLoader.load('strategies.yml');

        it('should properly inflate strategies', function () {
            strategiesRelease.should.have.property('strategies').with.lengthOf(3);
            strategiesRelease.strategies[0].constructor.name.should.be.equal('Strategy');
            strategiesRelease.strategies[0].should.have.property('name').equal('health_check');
        });

        it('should properly inflate actions in strategies', function () {
            strategiesRelease.strategies[0].should.have.property('actions').with.lengthOf(2);
            strategiesRelease.strategies[0].actions[0].constructor.name.should.equal('Metric');
            strategiesRelease.strategies[0].actions[1].constructor.name.should.equal('Test');
        });

        it('should properly inflate nested AND/OR statements', function () {
            var testAction = strategiesRelease.strategies[0].actions[1];
            testAction.condition.constructor.name.should.equal('AND');
            testAction.condition.should.have.property('actions').with.lengthOf(2);
            testAction.condition.actions[0].constructor.name.should.equal('OR');
            testAction.condition.actions[1].constructor.name.should.equal('OR');
        });

        it('should properly inflate action from type metric', function () {
            var testAction = strategiesRelease.strategies[0].actions[0];
            testAction.constructor.name.should.equal('Metric');
            testAction.should.have.property('providers');
        });

    });

    describe('#validator', function () {

        it('should throw an exception if a strategy is missing a name', function () {
            (function() { yamlLoader.load('validator/strategies.yml') }).should.throw('Strategy is missing name');
        });

        it('should throw an exception if a strategy is missing any actions', function () {
            (function() { yamlLoader.load('validator/strategies-missing-actions.yml') }).should.throw('Strategy is missing actions');
        });

    });
    
});