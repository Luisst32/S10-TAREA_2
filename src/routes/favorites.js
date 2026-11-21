const router = require('express').Router();
const controller = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.add);
router.delete('/:productoId', authenticate, controller.remove);

module.exports = router;
