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

    reset(){
        delete this._finishedAt;
        delete this._startedAt;
        delete this._failedAt;

        this.actions.forEach(action => {
            action.reset();
        });
    }

}
