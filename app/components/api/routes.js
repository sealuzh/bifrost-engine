import releaseRoute from './release'

export default function (app) {

    // Register Routes
    app.use('/api/v1/releases', releaseRoute);

    // All undefined asset or api routes should return a 404
    app.route('/*').get(function (req, res) {
        res.status(404).send({msg: 'route not found'});
    });
};
