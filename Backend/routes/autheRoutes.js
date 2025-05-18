const express = require('express');
const router = express.Router();
const {register,login,getAllUser,updateUserRole} = require('../Controllers/AuthController');

router.post('/register', register);
router.post('/login', login);
router.get('/', getAllUser);
router.put('/update', updateUserRole);

module.exports = router;