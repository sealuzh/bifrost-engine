import Action from '../action.js'
import log from '../../../log/log'

export default class Stop extends Action {

    constructor() {
        super();
        this.name = "Stop";
    }

    async evaluate(strategy, release) {
        release.isStopped = true;
        log.info({release: release, strategy: strategy, action: this}, `Stopping release temporarily`);
        return true;
    }

}