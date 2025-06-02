// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { googleLogin, protectedRoute } = require('../controllers/authController');

router.post('/google-login', googleLogin);
router.get('/protected', protectedRoute);

module.exports = router;
