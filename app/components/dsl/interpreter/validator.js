export default class Validator {

    constructor(array) {
        this.properties = array;
    }

    validate(obj) {
        this.properties.forEach(prop => {
            if (!obj.hasOwnProperty(prop)) {
                throw new Error(`${obj.constructor.name} is missing ${prop}`);
            }
        });
    }

}
