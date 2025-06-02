// routes/questionPaperRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { createQuestionPaper, deleteQuestionPaper } = require("../controllers/questionPaper");

const router = express.Router();

// const uploadDir = path.join(__dirname, "../uploads");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ["application/pdf", "application/msword", "image/jpeg", "image/jpg"];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only PDF, DOC, JPEG, and JPG files are allowed."), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 3 * 1024 * 1024 },
// });

// Routes
router.post("/upload",  createQuestionPaper);
router.delete("/delete/:id", deleteQuestionPaper);

module.exports = router;