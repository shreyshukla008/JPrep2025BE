const express = require("express");
const router = express.Router();
const { createSubject,
        getAllSubjects, 
        getQuestionPapersForSubject,
        findCourseByName,
        updateCourseById,
        deleteCourseById
        } = require("../controllers/subject");
const { verifyToken } = require("../middlewares/verifyToken");
const { hasRole } = require("../middlewares/roleMiddleware");


router.post("/create", verifyToken, hasRole("Admin", "Owner"), createSubject);
router.get("/getCourses", getAllSubjects);
router.get('/:subjectId/question-papers', getQuestionPapersForSubject);
router.post("/find", verifyToken, hasRole("Admin", "Owner"), findCourseByName);       
router.put("/update/:id", verifyToken, hasRole("Admin", "Owner"), updateCourseById);        
router.delete("/delete/:id", verifyToken, hasRole("Admin", "Owner"), deleteCourseById);   

module.exports = router;