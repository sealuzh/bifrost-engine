import Action from '../action.js'
import request from 'request-promise';
import TimedExecution from './executionWrapper/timedExecution.js';
import log from '../../../log/log'

export default class Request extends Action {

    constructor() {
        super();
        this.executionWrapper = new TimedExecution();
        this.name = "Request";
    }

    async evaluate(strategy, release) {
        log.info({release: release, strategy: strategy, action: this}, `Ping to ${this.url}`);

        var response = await request({uri: this.url, simple: false, resolveWithFullResponse: true});
        log.info({release: release, strategy: strategy, action: this}, `Got response, is ${response.statusCode}, should be ${this.status}`);

        return (response.statusCode == this.status);

    }

}