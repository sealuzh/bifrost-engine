'use strict';

import config from '../../../config/environment/index'
import Docker from 'dockerode'
import fs from 'fs'

var docker = null;

export default setupDocker();

/**
 * @returns {Docker}
 */
function setupDocker() {

    // TODO: DockerConfig in ENV-Vars / Injectable
    if (!docker && config.DOCKER_HOST && config.DOCKER_PORT && config.DOCKER_CA && config.DOCKER_CERT && config.DOCKER_CEY) {
        docker = new Docker(
            {
                host: config.DOCKER_HOST,
                port: config.DOCKER_PORT,
                ca: fs.readFileSync(config.DOCKER_CA),
                cert: fs.readFileSync(config.DOCKER_CERT),
                key: fs.readFileSync(config.DOCKER_KEY)
            }
        );
    }

    return docker;

}