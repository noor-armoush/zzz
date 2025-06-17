// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, signupUser ,  checkUsername ,  sendVerificationCode , verifyCode , resetPassword} = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/quick-check', checkUsername);
router.post("/send-code", sendVerificationCode);
router.post('/verify-code', verifyCode);
router.post('/reset-password', resetPassword);

module.exports = router;
