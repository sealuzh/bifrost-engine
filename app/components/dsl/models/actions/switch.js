import Action from '../action.js'
import log from '../../../log/log'

export default class Switch extends Action {

    constructor() {
        super();
        this.name = "Switch";
    }

    async evaluate(strategy, release) {
        strategy.next = this.next;
        log.info({release: release, strategy: strategy, action: this}, `Switched to strategy ${strategy.next}`);
        return true;
    }

}