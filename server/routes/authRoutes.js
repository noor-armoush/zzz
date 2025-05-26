const express = require('express');
const { loginUser  , signupUser  } = require('../controllers/authController');

const router = express.Router();


router.post('/login', loginUser);

// تسجيل مستخدم جديد
router.post('/signup', signupUser);

module.exports = router;