import asyncUtils from '../../../../utils/async'
import log from '../../../../log/log'
import AbstractExecution from './abstractExecution'

export default class TimedExecution extends AbstractExecution {

    constructor() {
        super();
        this.threshold = 1;
        this.intervalTime = 0;
        this.intervalLimit = 1;
        this.delay = 0;
        this.intervals = 0;
    }

    async execute(action, strategy, release) {

        let preEvaluation = await action.preEvaluate(strategy, release);

        let intervalCount = action.intervalLimit || this.intervalLimit;
        let interval = action.intervalTime || this.intervalTime;
        let threshold = action.threshold || this.threshold;
        let delay = action.delay || this.delay;

        let thresholdReached = 0;
        let result = false && preEvaluation;

        for (let intervals = 0; intervals < intervalCount; intervals++) {

            log.debug({release: release, strategy: strategy, action: action}, `[${this.intervals + 1}/${intervalCount}] Executing...`);

            await asyncUtils.delay(delay * 1000);

            let promiseResult = await action.evaluate(strategy, release);
            result = promiseResult || result;

            log.info({release: release, strategy: strategy, action: action}, `[${this.intervals + 1}/${intervalCount}] ${result}`);

            await asyncUtils.delay(interval * 1000);

            if (result) {
                thresholdReached++;
            }

            if (thresholdReached >= threshold) {
                break;
            }

        }

        log.debug({release: release, strategy: strategy, action: action}, `Result: ${result}`);

        let postEvaluation = await action.postEvaluate(strategy, release);
        result = result && postEvaluation;

        return result;
    }

}