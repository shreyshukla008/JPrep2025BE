// server/server.js
const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const cors = require('cors');
const admin = require('firebase-admin');
const dotenv = require("dotenv");
const path = require("path");

const database = require("./config/database");
const subjectRoutes = require("./routes/subject");
const questionPaperRoutes = require("./routes/questionPaper");
const authRoutes = require("./routes/auth"); 
const starredRoutes = require("./routes/starred");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4000;

// Body parser
app.use(express.json());

// CORS configuration
// Prefer setting FRONTEND_URL in your environment (e.g. https://j-prep2025.vercel.app)
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://j-prep2025.vercel.app';
const corsOptions = {
  origin: FRONTEND_URL,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true, // set to true if you use cookies or credentials from frontend
  optionsSuccessStatus: 200
};

// Apply CORS for all routes and ensure preflight (OPTIONS) is handled
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy
// This relaxes COOP/COEP so auth popups can close themselves (fixes window.close() blocked error).
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  // If you aren't using cross-origin isolation features, disable COEP
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// ✅ Firebase Admin SDK initialization (uncomment & configure if needed)
// admin.initializeApp({
//   credential: admin.credential.cert(require('./firebaseService.json')),
// });

// ✅ Connect to DB
database.connect();

// ✅ Routes
app.use("/api/question-papers", questionPaperRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/starred", starredRoutes);

// ✅ Home route
app.get("/", (req, res) => {
  res.send("Welcome to the Question Paper API!");
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
