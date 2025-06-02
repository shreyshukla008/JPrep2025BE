const express = require("express");
const router = express.Router();
const { createSubject, getAllSubjects, getQuestionPapersForSubject  } = require("../controllers/subject");


router.post("/create", createSubject);
router.get("/getCourses", getAllSubjects);
router.get('/:subjectId/question-papers', getQuestionPapersForSubject);

module.exports = router;