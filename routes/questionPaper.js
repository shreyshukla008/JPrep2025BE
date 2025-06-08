// routes/questionPaperRoutes.js
const express = require("express");
const router = express.Router();
const   {createQuestionPaper,
        deleteQuestionPaper,
        verifyQuestionPaper, 
        getUnverifiedQuestionPapers,
        getQuestionPaperByDetails, 
        } = require("../controllers/questionPaper");
const { verifyToken } = require("../middlewares/verifyToken");
const { hasRole } = require("../middlewares/roleMiddleware");

const {checkUploadPermission} = require("../middlewares/checkPermissions")




// const path = require("path");

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


router.post("/upload", verifyToken, checkUploadPermission,  createQuestionPaper);

router.delete("/delete/:id", verifyToken, hasRole("Admin", "Owner"), deleteQuestionPaper);

router.patch("/verify/:id", verifyToken, hasRole("Admin", "Owner"), verifyQuestionPaper);

router.get("/unverified", verifyToken, hasRole("Admin", "Owner"), getUnverifiedQuestionPapers);

router.post("/find", getQuestionPaperByDetails);

module.exports = router;