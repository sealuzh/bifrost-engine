import express from 'express'
import controller from './filter.controller'

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.get);

export default router;