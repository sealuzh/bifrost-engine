import Promise from 'bluebird'

import Orchestrator from './orchestrator'
import log from '../../../log/log'
import docker from '../../connectors/docker'
import _ from 'lodash'
import config from '../../../../config/environment/index'

export default class Docker extends Orchestrator {

    constructor() {
        super();
    }

    /**
     * deploy the services, given they are configured to be docker-containers to the specified overlay-network.
     * @param {[Service]} [services]
     */
    async deploy(services) {
        log.info(`${services.length} services need proxying`);
        for (var i = 0; i < services.length; i++) {
            await this.setupProxy(services[i]);
        }
    }

    /**
     *
     * @param {[Service]} [services]
     */
    async undeploy(services) {

        var asyncDocker = Promise.promisifyAll(docker);

        if (services.length > 0) {
            var runningContainers = await asyncDocker.listContainersAsync();

            // remove all running proxies
            var proxyContainers = _.filter(runningContainers, {Image: config.docker.proxyImage});

            log.info(`removing proxies - found ${proxyContainers.length} containers`);

            for (var i = 0; i < proxyContainers.length; i++) {
                var proxyContainer = Promise.promisifyAll(asyncDocker.getContainer(proxyContainers[i].Id)); // get service container by id
                await proxyContainer.removeAsync({force: true});
            }

            log.info(`removed proxies`);
            log.info(`restoring services - found ${services.length} containers`);

            // rename services to restore functionality
            for (var i = 0; i < services.length; i++) {
                var service = services[i];
                var serviceContainerJSON = _.find(runningContainers, {Names: ['/' + service.host + '_proxied']});
                var serviceContainer = Promise.promisifyAll(asyncDocker.getContainer(serviceContainerJSON.Id));
                //await serviceContainer.renameAsync({name: service.host}); TODO: fix when docker implements alias-support in remote API
            }

            log.info(`services restored`);

        }

    }

    /**
     *
     * @param {Service} service
     */
    async getContainer(service) {
        var asyncDocker = Promise.promisifyAll(docker);
        var runningContainers = await asyncDocker.listContainersAsync();
        var serviceContainerJSON = _.find(runningContainers, {Names: ['/' + service.host]});

        // TODO: refactor this
        // container not found, may be a compose project
        if (serviceContainerJSON == undefined) {
            serviceContainerJSON = _.find(runningContainers, {Labels: {"com.docker.compose.service": service.host}});
        }

        var serviceContainer = Promise.promisifyAll(asyncDocker.getContainer(serviceContainerJSON.Id));

        return serviceContainer;
    }

    async setupProxy(service) {

        var asyncDocker = Promise.promisifyAll(docker);

        log.info(`Searching for [${service.host}]`);

        var serviceContainer = await this.getContainer(service);
        var serviceContainerAsync = Promise.promisifyAll(serviceContainer);
        var serviceContainerInspected = await serviceContainerAsync.inspectAsync();

        log.info(`Creating Proxy for [${service.host}]`);

        var proxyConfig = {
            Image: config.docker.proxyImage,
            name: serviceContainerInspected.Name.substr(1) + '_proxy',
            ExposedPorts: {}
        };

        if (service.env) {
            proxyConfig.Env = service.env;
            proxyConfig.Env.push("PROXIED_HOST=" + service.host);
            proxyConfig.Env.push("PROXIED_PORT=" + service.port.toString());
        }

        proxyConfig.ExposedPorts[service.port + "/tcp"] = {};
        proxyConfig.ExposedPorts["9090/tcp"] = {}; // TODO: make configurable or move somewhere else

        try {
            var proxyContainer = await asyncDocker.createContainerAsync(proxyConfig);
        } catch (err) {
            // conflict. proxy is already deployed
            if (err.statusCode == 409) {
                return;
            }
        }

        var proxyContainer = await asyncDocker.createContainerAsync(proxyConfig);
        proxyContainer = Promise.promisifyAll(proxyContainer);

        await proxyContainer.startAsync({});

        log.info('setting up network for proxyContainer');

        // Connect the Proxy-Container to the existing Overlay-Network
        var networks = await asyncDocker.listNetworksAsync({"filters": '{"name": ["' + this.network + '"]}'});
        var network = Promise.promisifyAll(asyncDocker.getNetwork(networks[0].Id));
        var result = await network.connectAsync({Container: proxyContainer.id, Aliases: [service.host]});

        /* TODO: fix when docker implements alias-support in remote API
         // Rename Proxy to Service and Service to *_proxied
         this.containerNames[service.host] = serviceContainer.Names[0].substr(1); // cut off backlash

         await serviceContainer.renameAsync({name: `${service.host}_proxied`});
         await proxyContainer.renameAsync({name: service.host});
         */

    }

    getMapping() {
        return this.mapping;
    }

}
