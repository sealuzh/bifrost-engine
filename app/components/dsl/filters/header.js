import Filter from './filter'

export default class Header extends Filter {

    constructor() {
        super();
        this.percentage = 100;
    }

    /**
     * @param {Service} [serviceFrom]
     * @param {Service} [serviceTo]
     * @returns {{field: string, value: string, traffic: number, targetHost: *, targetPort: *}}
     */
    constructFilterOptions(serviceFrom, serviceTo, intervals) {
        return {
            field: this.field,
            value: this.value,
            traffic: this.percentage,
            targetHost: serviceTo.host,
            targetPort: serviceTo.port
        }
    }

}