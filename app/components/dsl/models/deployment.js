import _ from 'lodash'

export default class Deployment {

    constructor() {
    }

    /**
     * Returns configuration of proxy. Either default of DSL, or DSL-Engine as fallback
     * @returns {*}
     */
    getProxyConfig() {
        return {
            mapping: this.orchestrator.getMapping()
        };
    }

    /**
     *
     * @param name
     * @returns {Service}
     */
    findServiceByName(name) {
        var service = _.find(this.services, {name: name});
        return service;
    }

    /**
     * deploy the application given its orchestrator.
     */
    async deploy() {
        await this.orchestrator.deploy(this.services);
    }

    /**
     * undeploy the application given its orchestrator.
     */
    async undeploy() {
        await this.orchestrator.undeploy(this.services);
    }

    reset() {
        delete this._startedAt;
        delete this._finishedAt;
        delete this._failedAt;
    }

}
