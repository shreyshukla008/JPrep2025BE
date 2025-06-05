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
// const PORT = process.env.PORT || 4000;
const PORT = process.env.PORT;
if (!PORT) {
  throw new Error("❌ PORT environment variable is not set.");
}

app.use(cors());

// OR more explicitly:
app.use(cors({ origin: '*' }));

app.use(cors());
app.use(express.json());

// ✅ Firebase Admin SDK initialization
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
