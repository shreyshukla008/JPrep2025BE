// Define allowed roles directly in the middleware file

const allowedRoles = new Set(["Admin", "Instructor", "Owner", "Student"]);

const checkUploadPermission = (req, res, next) => {
const userRole = req.user?.role;
    console.log("userRole: ", userRole);
  if (!userRole || !allowedRoles.has(userRole)) {
    return res.status(403).json({ message: "Upload not permitted for this role." });
  }
  next();
};

const checkStarPermission = (req, res, next) => {
    const userRole = req.user?.role;
    console.log("userRole: ", userRole);
  if (!userRole || !allowedRoles.has(userRole)) {
    return res.status(403).json({ message: "Starring not permitted for this role." });
  }
  next();
};

module.exports = {
  checkUploadPermission,
  checkStarPermission,
};
