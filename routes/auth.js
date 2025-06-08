// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { googleLogin, protectedRoute, guestLogin } = require('../controllers/authController');

router.post('/google-login', googleLogin);
router.get('/protected', protectedRoute);
router.post('/guest-login', guestLogin);

module.exports = router;
