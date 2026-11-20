const router = require('express').Router();
const controller = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', authenticate, requireAdmin, controller.create);
router.put('/:id', authenticate, requireAdmin, controller.update);
router.delete('/:id', authenticate, requireAdmin, controller.remove);
module.exports = router;
