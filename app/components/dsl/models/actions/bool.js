import Action from '../action.js'
import Promise from 'bluebird'
import log from '../../../log/log'

class AND extends Action {

    constructor() {
        super();
        this.name = "AND";
    }

    async evaluate(strategy, release) {

        log.info({release: release, strategy: strategy, action: this}, `${this.actions.length} Actions`);

        var actionPromises = [];

        this.actions.forEach(action => {
            actionPromises.push(action.execute(strategy, release));
        });

        actionPromises = await Promise.all(actionPromises);

        var returnValue;

        actionPromises.forEach(actionResult => {
            if (returnValue === undefined) {
                returnValue = actionResult;
            } else {
                returnValue = returnValue && actionResult;
            }
        });

        log.info({release: release, strategy: strategy, action: this}, `${this.actions.length} Actions Done`);

        return returnValue || false;

    }

}

class OR extends Action {

    constructor() {
        super();
        this.name = "OR";
    }

    async evaluate(strategy, release) {

        log.info({release: release, strategy: strategy, action: this}, `${this.actions.length} Actions`);

        var actionPromises = [];

        this.actions.forEach(action => {
            actionPromises.push(action.execute(strategy, release));
        });

        actionPromises = await Promise.all(actionPromises);

        var returnValue;
        actionPromises.forEach(actionResult => {
            if (returnValue === undefined) {
                returnValue = actionResult;
            } else {
                returnValue = returnValue || actionResult;
            }
        });

        log.info({release: release, strategy: strategy, action: this}, `${this.actions.length} Actions Done`);

        return returnValue || false;

    }

}

export default {OR: OR, AND: AND};