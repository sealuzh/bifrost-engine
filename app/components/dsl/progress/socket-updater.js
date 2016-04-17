import Engine from '../engine/engine'
import log from '../../log/log'

export default  {

    io: null,

    setup: function (socketIO) {
        this.io = socketIO;
        var so = this;

        this.io.on('connection', function (socket) {
            log.info('BiFrost-Client has connected');

            socket.on('release', async function (msg) {
                try {
                    var release = await Engine.queue(msg);
                    await Engine.start(release);
                } catch (err) {
                    return log.fatal(err);
                }
            });

            socket.on('release:continue', async function (releaseId) {
                try {
                    await Engine.continue(releaseId);
                } catch (err) {
                    return log.fatal(err);
                }
            });

            socket.on('release:dry', function (msg) {
                log.info('Dry-Run scheduled. Verifying Bifrost DSL...');
                try {
                    var release = Engine.dry(msg);
                    log.info({release: this}, 'Successfully verified.');
                    release.broadcastUpdate('release:verified');
                } catch (err) {
                    log.info('Verification failed.' + err);
                    return log.info(err);
                }
            });

            socket.on('deploy', function (msg) {
                var releaseObj = interpreter.parse(msg);
                Engine.queueDeployment(releaseObj);
            });

            socket.on('disconnect', function () {
                log.info('BiFrost-Client has disconnected');
            });
        });
    },

    broadcast: function (event, data) {
        if (this.io) this.io.sockets.emit(event, data);
    }

}
