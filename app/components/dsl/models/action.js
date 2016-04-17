import DefaultExecution from './actions/executionWrapper/defaultExecution.js';
import log from '../../log/log'

export default class Action {

    constructor() {
        this.executionWrapper = new DefaultExecution();
        this.name = "Action";
    }

    /**
     * Executes the action considering its executionWrapper.
     * @param {Strategy} strategy
     * @param {Release} release
     * @returns {Boolean}
     */
    async execute(strategy, release) {
        this._startedAt = new Date();

        var actionResult = await this.executionWrapper.execute(this, strategy, release);

        log.info({release: release, strategy: strategy, action: this}, `Result :[${actionResult}], next Strategy --> ${strategy.next}`);

        if (actionResult) {
            this._finishedAt = new Date();
            if (this.onTrue && actionResult) {
                this.onTrue.execute(strategy, release);
            }
        } else {
            this._failedAt = new Date();
            if (this.onFalse && !actionResult) {
                this.onFalse.execute(strategy, release);
            }
        }

        return actionResult;
    }

    /**
     * Hook that gets executed before the action is actually executed.
     * @param {Strategy} strategy
     * @param {Release} release
     * @returns {boolean}
     */
    async preEvaluate(strategy, release) {
        return true;
    }

    /**
     * Hook that holds the actual implementation of what the action does.
     * @param {Strategy} strategy
     * @param {Release} release
     * @returns {boolean}
     */
    async evaluate(strategy, release) {
        return true;
    }

    /**
     * Hook that gets executed after the action is completely executed (all runs if there are multiple)
     * @param {Strategy} strategy
     * @param {Release} release
     * @returns {boolean}
     */
    async postEvaluate(strategy, release) {
        return true;
    }

    reset() {
        delete this._finishedAt;
        delete this._startedAt;
        delete this._failedAt;

        if (this.actions) {
            this.actions.forEach(action => {
                action.reset();
            });
        }
    }

}
