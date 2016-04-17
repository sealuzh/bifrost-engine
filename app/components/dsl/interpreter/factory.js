'use strict';

import Release from '../models/release'
import Strategy from '../models/strategy'

import Request from '../models/actions/request';
import Route from '../models/actions/route';
import Test from '../models/actions/test';
import Metric from '../models/actions/metric';
import Stop from '../models/actions/stop';
import Switch from '../models/actions/switch';

import Prometheus from '../models/actions/metricProvider/prometheus/prometheus';

import BOOL from '../models/actions/bool';

import Deployment from '../models/deployment'
import Service from '../models/service'

import DockerDeployment from '../deployment/orchestrators/docker'
import ProxyDeployment from '../deployment/orchestrators/proxy'

import FilterTraffic from '../filters/traffic'
import FilterHeader from '../filters/header'

import Validator from './validator'

export default class Factory {

    /**
     *
     * @returns {Map}
     */
    static getMap() {

        var classMap = new Map();

        // General Keys
        classMap.set('release', {obj: Release, validator: new Validator(['name'])});
        classMap.set('strategy', {obj: Strategy, validator: new Validator(['name', 'actions'])});
        classMap.set('deployment', {obj: Deployment, validator: new Validator(['orchestrator', 'services'])});
        classMap.set('service', {obj: Service, validator: new Validator(['name', 'host', 'port'])});

        // Orchestrators
        classMap.set('docker', {obj: DockerDeployment, validator: new Validator(['network'])});
        classMap.set('proxy', {obj: ProxyDeployment, validator: new Validator(['mapping'])});

        // Actions
        classMap.set('route', {obj: Route, validator: new Validator(['from', 'to', 'filters'])});
        classMap.set('request', {obj: Request, validator: new Validator(['url', 'status'])});
        classMap.set('test', {obj: Test, validator: new Validator(['condition'])});
        classMap.set('AND', {obj: BOOL.AND, validator: new Validator(['actions'])});
        classMap.set('OR', {obj: BOOL.OR, validator: new Validator(['actions'])});
        classMap.set('metric', {obj: Metric, validator: new Validator(['providers', 'validator'])});
        classMap.set('stop', {obj: Stop});
        classMap.set('switch', {obj: Switch, validator: new Validator(['next'])});

        // Metrics Provider
        classMap.set('prometheus', {obj: Prometheus, validator: new Validator(['name', 'query'])});

        // Filters
        classMap.set('header', {obj: FilterHeader, validator: new Validator(['field', 'value'])});
        classMap.set('traffic', {obj: FilterTraffic});

        return classMap;
    }

    static getMapping() {
        let actions = ['route', 'request', 'AND', 'OR', 'test', 'metric', 'stop', 'switch'];

        return {
            deployment: 'deployment',
            orchestrator: ['docker', 'proxy'],
            strategies: 'strategy',
            services: 'service',
            actions: actions,
            onTrue: actions,
            onFalse: actions,
            condition: actions,
            providers: ['prometheus'],
            AND: 'AND',
            OR: 'OR',
            filters: ['header', 'traffic']
        }
    }

    static getInstance(value, target) {
        var bundle = this.getMap().get(value);
        var classObj = new bundle.obj();

        if (value === 'AND' || value === 'OR') {
            if (Array.isArray(target)) {
                var array = target;
                target = {actions: array};
            }
        }

        Object.assign(classObj, target);

        if (bundle.validator) {
            bundle.validator.validate(classObj);
        }

        return classObj;
    }

}