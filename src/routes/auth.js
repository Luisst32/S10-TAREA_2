const router = require('express').Router();
const controller = require('../controllers/authController');
router.post('/registro', controller.register);
router.post('/login', controller.login);
module.exports = router;
