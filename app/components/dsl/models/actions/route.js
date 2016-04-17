import Action from '../action.js'
import log from '../../../log/log'
import TimedExecution from './executionWrapper/timedExecution.js';

export default class Route extends Action {

    constructor() {
        super();
        this.executionWrapper = new TimedExecution();
        this.persistance = false;
        this.name = "Route";
    }

    /**
     * Route configures the Proxy according to the attached Proxy-Handler of the service.
     */
    async evaluate(strategy, release) {

        log.info({release: release, strategy: strategy, action: this}, `[${this.from}] --> [${this.to}], setting ${this.filters.length} filter(s)`);

        var filterPromises = [];

        var fromService = release.deployment.findServiceByName(this.from);
        var toService = release.deployment.findServiceByName(this.to);
        var proxyConfig = release.deployment.getProxyConfig();

        var intervals = this.executionWrapper.intervals;

        this.filters.forEach(filter => {
            filterPromises.push(filter.apply(proxyConfig, fromService, toService, intervals));
        });

        return await Promise.all(filterPromises);
    }

    async postEvaluate(strategy, release) {

        if (this.persistance) {
            return true;
        }

        var filterPromises = [];

        var fromService = release.deployment.findServiceByName(this.from);
        var toService = release.deployment.findServiceByName(this.to);
        var proxyConfig = release.deployment.getProxyConfig();

        log.info({release: release, strategy: strategy, action: this}, `[${fromService.name}] <-- [${toService.name}], removing ${this.filters.length} filter(s)`);

        this.filters.forEach(filter => {
            filterPromises.push(filter.clear(proxyConfig, fromService, toService));
        });

        return await Promise.all(filterPromises);

    }


}