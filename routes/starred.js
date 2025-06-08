const express = require("express");
const router = express.Router();
const { createStarredSubject, removeStarredSubject, getStarredSubjects  } = require("../controllers/Starred");
const {checkStarPermission} = require("../middlewares/checkPermissions");
const { verifyToken } = require("../middlewares/verifyToken");


router.post("/add", verifyToken, checkStarPermission,  createStarredSubject);
router.post("/remove", verifyToken, checkStarPermission, removeStarredSubject);
router.get("/user/:userId", verifyToken, checkStarPermission, getStarredSubjects);

module.exports = router;