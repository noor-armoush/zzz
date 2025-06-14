// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, signupUser ,  checkUsername , verifyEmail , sendVerificationCode} = require('../controllers/authController');

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/quick-check', checkUsername);
router.post("/verify-email", verifyEmail);
router.post("/send-code", sendVerificationCode);
module.exports = router;
