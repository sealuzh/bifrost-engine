import Orchestrator from './orchestrator'
import log from '../../../log/log'

export default class Proxy extends Orchestrator {

    constructor() {
        super();
    }

    async deploy(services) {
        log.info(`proxy-mapping detected.`);
        services.forEach(service => {
            log.info(`Service "${service.host}" <-> "${this.mapping[service.host]}"`);
        });
    }

    async undeploy(services) {
        log.info(`proxy-mapping detected, not gonna undeploy them.`);
    }

    getMapping() {
        return this.mapping;
    }

}
