import express from 'express'
import controller from './release.controller'

var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.index);
router.get('/:id', controller.get);
router.delete('/:id', controller.delete);
router.put('/:id/start', controller.start);
router.put('/:id/reset', controller.reset);
router.get('/:id/proxies', controller.proxies);
router.put('/:id/clearproxies', controller.clearProxies);

export default router;