import AbstractExecution from './abstractExecution'

export default class DefaultExecution extends AbstractExecution {

    constructor() {
        super();
    }

    async execute(action, strategy, release) {
        let preEvaluation = await action.preEvaluate(strategy, release);
        let evaluation = await action.evaluate(strategy, release);
        let postEvaluation = await action.postEvaluate(strategy, release);

        return preEvaluation && evaluation && postEvaluation;
    }
}