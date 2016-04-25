import log from '../../log/log'
import Promise from 'bluebird'
import _ from 'lodash'

export default class Strategy {

    constructor() {
        this._id = null;
        this.next = null;
    }

    /**
     *
     * @param {Release}
     */
    async execute(release) {

        log.info({release: true, strategy: this}, 'Starting');

        var actionPromises = [];

        log.info({release: true, strategy: this}, `Scheduling ${this.actions.length} action(s)`);

        this.actions.forEach(action => {
            actionPromises.push(action.execute(this, release));
        });

        var results = await Promise.all(actionPromises);

        log.info({release: true, strategy: this}, 'Finished');

    }

    update(storedRelease, strategyIndex) {

        if (this._startedAt !== undefined) {
            storedRelease.strategies[strategyIndex]._startedAt = this._startedAt;
        }

        if (this._finishedAt !== undefined) {
            storedRelease.strategies[strategyIndex]._finishedAt = this._finishedAt;
        }

        if (this._failedAt !== undefined) {
            storedRelease.strategies[strategyIndex]._failedAt = this._failedAt;
        }

        this.actions.forEach(action => {
            action.update(storedRelease, strategyIndex, this.actions.indexOf(action));
        });
    }

    reset() {
        delete this._finishedAt;
        delete this._startedAt;
        delete this._failedAt;

        this.actions.forEach(action => {
            action.reset();
        });
    }

}
