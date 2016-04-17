import log from '../../log/log'
import storage from '../../storage/storage'
import Interpreter from '../interpreter/interpreter'
import Promise from 'bluebird'

var interpreter = new Interpreter();
var releases = Promise.promisifyAll(storage.releases);

export default {

    stopped: {},

    list: async function () {
        return await releases.findAsync({});
    },

    get: async function (id) {
        var release = await releases.findOneAsync({_id: id});
        release = interpreter.parse(release);
        return release;
    },

    queue: async function (releaseJSON) {
        var release = await releases.insertAsync(releaseJSON);
        release = interpreter.parse(release);
        release.broadcastUpdate('release:create');
        return release;
    },

    dry: function (releaseJSON) {
        var release = interpreter.parse(releaseJSON);
        return release;
    },

    deploy: async function (id) {
        var release = await this.get(id);
        release.broadcastUpdate('deployment:queued');

        try {
            await release.deploy();
        } catch (err) {
            await release.undeploy();
            release._failedAt = new Date();
            release.broadcastUpdate();
        }

        await releases.updateAsync({_id: release._id}, release);
        release.broadcastUpdate('deployment:done');
    },

    continue: async function (id) {
        log.info(`Fetching #${id}`);
        var release = this.stopped[id];
        release.isStopped = false;
        return this.start(release);
    },

    /**
     * @param {Release} release
     */
    start: async function (release) {

        if (release._startedAt) {
            log.info({release: release}, `Release continues`);
        }

        release._startedAt = new Date();
        release._isRunning = true;
        release.broadcastUpdate();

        while (!release.isFinished) {

            release.getActiveStrategy()._startedAt = new Date();
            release.getActiveStrategy()._finishedAt = null;
            release.broadcastUpdate();

            try {
                await release.getActiveStrategy().execute(release);
            } catch (err) {
                log.info(err);
                release.getActiveStrategy()._failedAt = new Date();
                release.broadcastUpdate();
            } finally {
                release.getActiveStrategy()._finishedAt = new Date();
                release.broadcastUpdate();
            }

            release.nextStrategy();

            // Release can be stopped after a strategy
            if (release.isStopped) {
                this.stopped[release._id] = release;
                release.broadcastUpdate('release:stop', release._id);
                log.info({release: release}, `Stopped.`);
                return;
            }

        }

        log.info({release: release}, `Finished.`);
        release._finishedAt = new Date();
        await releases.updateAsync({_id: release._id}, release);
        release.broadcastUpdate();
    }

}