import Promise from 'bluebird';
import _ from 'lodash';

import Action from '../action.js'
import log from '../../../log/log'

import TimedExecution from './executionWrapper/timedExecution'

import SimpleCheck from './metricProvider/checkFunctions/simple'
import ComparisonCheck from './metricProvider/checkFunctions/comparison'
import RequestCheck from './metricProvider/checkFunctions/request'

export default class Metric extends Action {

    constructor() {
        super();
        this.name = "Metric";
        this.executionWrapper = new TimedExecution();
    }

    /**s
     * Route configures the Proxy according to the attached Proxy-Handler of the service.
     * @param {Strategy}
     * @param {Release}
     * @returns {Boolean}
     */
    async evaluate(strategy, release) {

        log.debug({strategy: strategy, action: this}, 'Evaluating providers');

        var providerPromises = [];

        this.providers.forEach(provider => {
            providerPromises.push(provider.evaluate(strategy, release));
        });

        var providerResults = await Promise.all(providerPromises);

        log.debug(providerResults);

        // TODO: Refactor
        if (_.startsWith(this.validator, '=') || _.startsWith(this.validator, '!') || _.startsWith(this.validator, '<') || _.startsWith(this.validator, '>')) {
            var result = await SimpleCheck.check(providerResults, {expression: this.validator});
        } else if (_.startsWith(this.validator, 'http')) {
            var result = await RequestCheck.check(providerResults, {expression: this.validator});
        } else {
            var result = await ComparisonCheck.check(providerResults, {expression: this.validator});
        }

        log.debug({strategy: strategy, action: this}, 'Returning result ' + result);

        return result;

    }

}