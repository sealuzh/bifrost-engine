import log from '../../log/log'
import _ from 'lodash'
import socketUpdater from '../progress/socket-updater'

export default class Release {

    constructor() {
        this.strategies = [];
        this.deployment = null;
        this.activeStrategyIndex = 0;
        this.isFinished = false;
        this.isStopped = false;
    }

    /**
     * @param {String}
     * @returns {Strategy}
     */
    getStrategyByName(name) {
        return _.find(this.strategies, {name: name});
    }

    getActiveStrategy() {
        return this.strategies[this.activeStrategyIndex];
    }

    setActiveStrategyByName(name) {
        this.activeStrategyIndex = this.strategies.indexOf(this.getStrategyByName(name));
    }

    advanceActiveStrategy() {
        if (this.strategies[this.activeStrategyIndex + 1] !== undefined) {
            this.activeStrategy = this.strategies[this.activeStrategyIndex + 1];
            log.info({release: this}, `Next: ${this.activeStrategy.name}`);
            this.setActiveStrategyByName(this.activeStrategy.name);
        } else {
            log.debug({release: this}, `Release is out of strategies`);
            this.isFinished = true;
        }
    }

    /**
     * Advances the current Strategy
     */
    nextStrategy() {
        log.debug({release: this}, 'Advancing Strategy');

        var nextStrategy = this.getActiveStrategy();

        if (nextStrategy.next) {
            if (nextStrategy.next == 'finish' || nextStrategy.next == 'rollback') {
                this.isFinished = true;
            } else {
                log.debug({release: this}, `Next strategy is defined as ${nextStrategy.next}`);
                this.setActiveStrategyByName(nextStrategy.next);
            }
        } else {
            this.advanceActiveStrategy();
        }

    }

    update(storedRelease) {
        this.strategies.forEach(strategy => {
            strategy.update(storedRelease, this.strategies.indexOf(strategy));
        });

        if (this.isFinished !== undefined) {
            storedRelease.isFinished = this.isFinished;
        }

        if (this.isStopped !== undefined) {
            storedRelease.isStopped = this.isStopped;
        }

        if (this.activeStrategyIndex !== undefined) {
            storedRelease.activeStrategyIndex = this.activeStrategyIndex;
        }

        if (this._startedAt !== undefined) {
            storedRelease._startedAt = this._startedAt;
        }

        if (this._finishedAt !== undefined) {
            storedRelease._finishedAt = this._finishedAt;
        }

        if (this._failedAt !== undefined) {
            storedRelease._failedAt = this._failedAt;
        }
    }

    reset() {
        this.isFinished = false;
        this.isStopped = false;
        this.activeStrategyIndex = 0;

        delete this._startedAt;
        delete this._finishedAt;
        delete this._failedAt;

        this.deployment.reset();

        this.strategies.forEach(strategy => {
            strategy.reset();
        });
    }

    /**
     * @param {Release} release
     */
    async deploy() {

        log.info({release: this}, 'Deploying...');

        // Send Progress
        this.deployment._startedAt = new Date();
        this.deployment._finishedAt = null;
        this.broadcastUpdate();

        try {
            await this.deployment.deploy();
        } catch (err) {
            log.warn(err, 'Something went wrong while deploying');
            this.deployment._failedAt = new Date();
            this.broadcastUpdate();
        } finally {
            log.info({release: this}, 'Successful.');
            this.deployment._finishedAt = new Date();
            this.broadcastUpdate();
        }

    }

    /**
     * @param {Release} release
     */
    async undeploy() {

        log.info({release: this}, 'Undeploying...');

        try {
            await this.deployment.undeploy();
        } catch (err) {
            log.warn(err, 'Something went wrong while deploying');
            this.deployment._failedAt = new Date();
            this.broadcastUpdate();
        } finally {
            log.info({release: this}, 'Successful.');
            this.deployment._finishedAt = new Date();
            this.broadcastUpdate();
        }

    }

    broadcastUpdate(event) {
        socketUpdater.broadcast(event || 'release:update', this);
    }

}
