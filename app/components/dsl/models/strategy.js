import log from '../../log/log'
import Promise from 'bluebird'

export default class Strategy {

    constructor() {
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

    update(storedStrategy) {
        this.actions.forEach((action, index) => {
            action.update(storedStrategy.actions[index]);
        });

        if (this._startedAt !== undefined) {
            storedStrategy._startedAt = this._startedAt;
        }

        if (this._finishedAt !== undefined) {
            storedStrategy._finishedAt = this._finishedAt;
        }

        if (this._failedAt !== undefined) {
            storedStrategy._failedAt = this._failedAt;
        }
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
