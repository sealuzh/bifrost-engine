import Release from '../models/release.js'
import Factory from './factory.js'
import log from '../../log/log';

/**
 * Returns a Release-Object of a passed Configuration
 * @returns {Release}
 */
export default class Interpreter {

    constructor() {

    }

    /**
     *
     * @param json
     * @returns {Release}
     */
    parse(json) {
        let release = new Release();

        // Fill Object
        Object.assign(release, json);

        // Instantiate Classes
        this.objectify(release, Factory);

        return release;
    }

    /**
     *
     * @param configuration
     * @returns {Release}
     */
    objectify(target, factory) {

        var keyMap = factory.getMapping();

        for (var property in target) {
            if (target.hasOwnProperty(property)) {
                if (typeof target[property] == "object") {
                    if (keyMap.hasOwnProperty(property)) {
                        if (Array.isArray(target[property])) {
                            log.debug(`objectified array of ${property}`);
                            var array = target[property];
                            for (var arrIndex in array) {
                                array[arrIndex] = this.objectifyObject(array[arrIndex], property, factory)
                            }
                        } else {
                            target[property] = this.objectifyObject(target[property], property, factory)
                        }
                    }
                    this.objectify(target[property], factory);
                } else {
                    if ((property == 'onTrue' || property == 'onFalse') && typeof target[property] == "string") {
                        if (keyMap.hasOwnProperty(property)) {
                            var tmp = target[property];
                            target[property] = this.objectifyObject({switch: {next: tmp}}, property, factory)
                        }
                    }
                }
            }
        }
    }

    /**
     *
     * @param target
     * @param factory
     */
    objectifyObject(target, property, factory) {

        var keyMap = factory.getMapping();

        var key = Object.keys(target)[0];

        if (Array.isArray(keyMap[property])) {

            var classTypes = keyMap[property];

            if (classTypes.indexOf(key) !== -1) {
                var classObj = factory.getInstance(key, target[key]);
                log.debug(`objectified ${keyMap[property]} - is now a ${classObj.constructor.name}`);
                return classObj;
            }

        } else {

            if (property === 'AND' || property === 'OR') {
                var array = target[key];
                target.actions = array;
                delete target[key];
            }

            var classObj = factory.getInstance(keyMap[property], target);

            log.debug(`objectified ${keyMap[property]} - is now a ${classObj.constructor.name}`);
            return classObj;
        }
    }

}