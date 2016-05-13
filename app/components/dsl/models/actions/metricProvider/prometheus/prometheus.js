import Action from '../../../action'
import log from '../../../../../log/log'
import request from 'request-promise';
import config from '../../../../../../config/environment/index'

var MAX_NUMBER_OF_TRIES = 5;

export default class Prometheus extends Action {

    constructor() {
        super();
        this.time = null;
        this.type = 'Prometheus';
        this.prometheusUrl = config.PROMETHEUS;
        this.tries = 0;
    }

    /**
     *
     * @param {Strategy}
     * @param {Release}
     * @returns {Object}
     */
    async evaluate(strategy, release) {

        this.tries++;

        try {
            log.info({release: release, strategy: strategy, action: this}, `${this.query} at ${this.prometheusUrl}`);
            var responseObj = await this.queryPrometheus(this.query, this.time || new Date());
            log.debug({release: release, strategy: strategy, action: this}, responseObj.body);
            var metric = this.extractMetric(responseObj);
            log.info({release: release, strategy: strategy, action: this}, `Result: ${metric}`);
        } catch (err) {
            log.warn({release: release, strategy: strategy, action: this}, err.toString());
            log.warn({release: release, strategy: strategy, action: this}, `Querying prometheus or extracting the result failed. Retrying...`);
            if (this.tries < MAX_NUMBER_OF_TRIES) {
                return this.evaluate(strategy, release);
            } else {
                throw err;
            }
        }

        return {name: this.name, metric: metric};
    }

    queryPrometheus(query, time) {
        return request({uri: `${this.prometheusUrl}/api/v1/query?query=${query}&time=${time.getTime() / 1000}`, simple: false, resolveWithFullResponse: true});
    }

    extractMetric(responseObj) {
        return JSON.parse(responseObj.body).data.result[0].value[1]; // TODO: This doesn't seem right. It should also work with non-scalar outputs.
    }

}