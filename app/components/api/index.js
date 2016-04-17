import express from 'express'
import routes from './routes'
import config from './config'

var app = express();

config(app);
routes(app);

export default app;