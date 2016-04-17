'use strict';

import log from '../../log/log'

var exports = {

    proxyConfigurations: [],

    /**
     *
     * @param service
     * @param {ProxyConfiguration} proxyConfiguration
     */
    addConfiguration(proxyConfiguration) {
        this.proxyConfigurations.push(proxyConfiguration);
    }

};

export default exports;