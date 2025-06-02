const express = require("express");
const router = express.Router();
const { createStarredSubject, removeStarredSubject, getStarredSubjects  } = require("../controllers/Starred");


router.post("/add", createStarredSubject);
router.post("/remove", removeStarredSubject);
router.get("/user/:userId", getStarredSubjects);

module.exports = router;