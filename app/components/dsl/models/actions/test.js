import Action from '../action.js'
import TimedExecution from './executionWrapper/timedExecution.js';
import log from '../../../log/log'

export default class Test extends Action {

    constructor() {
        super();
        this.executionWrapper = new TimedExecution();
        this.name = "Test";
    }

    async evaluate(strategy, release) {
        var returnValue = false;

        if (Array.isArray(this.condition)) {

        } else {
            returnValue = await this.condition.evaluate(strategy, release);
        }

        return returnValue;
    }

}