import Filter from './filter'

export default class Traffic extends Filter {

    constructor() {
        super();
        this.percentage = 100;
        this.step = 5;
        this.sticky = false;
        this.shadow = false;
    }

    constructFilterOptions(serviceFrom, serviceTo, intervals) {
        var appliedPercentage = this.percentage;

        if (intervals) {
            appliedPercentage = Math.min(this.percentage + (this.step * intervals), 100);
        }

        return {
            traffic: appliedPercentage,
            sticky: this.sticky,
            shadow: this.shadow,
            targetHost: serviceTo.host,
            targetPort: serviceTo.port
        }
    }

}