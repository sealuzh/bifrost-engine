import compression from 'compression'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import errorHandler from 'errorhandler'
import bunyanLogger from 'express-bunyan-logger'
import log from '../log/log'

export default function (app) {
    var env = app.get('env');

    app.use(compression());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());

    if ('production' === env) {
        app.use(bunyanLogger({logger: log}));
    }

    if ('development' === env) {
        app.use(bunyanLogger({logger: log}));
        app.use(errorHandler()); // Error handler - has to be last
    }

}