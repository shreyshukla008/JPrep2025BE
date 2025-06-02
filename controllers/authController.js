// server/controllers/authController.js
const admin = require('../config/firebaseAdmin');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || "sample-test";

exports.googleLogin = async (req, res) => {
  const { token } = req.body;
  console.log("token in backend: ", token);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { email, name, uid } = decodedToken;

    console.log("in backend function received email: " , email, " name: " , name, " and uid: " , uid);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, uid, role: "Student",         // or any default
        password: "from-google"});
    }

    const jwtToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token: jwtToken, user });
  } catch (err) {
    res.status(401).json({Error: err, message: 'Invalid token' });
  }
};

exports.protectedRoute = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: 'You are authorized ✅', user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
