// controllers/fileController.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadFile, setFilePermissions, listFiles, downloadFile, deleteFile } = require("../services/driveService");

const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/msword", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, JPEG, and JPG files are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";
const domain = "mail.jiit.ac.in";

exports.upload = upload.single("file");

exports.uploadFileController = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file found!" });

  const filePath = path.join(uploadDir, req.file.filename);
  try {
    const fileData = await uploadFile(req.file, folderId);
    await setFilePermissions(fileData.id, domain);
    await deleteLocalFile(filePath);

    res.status(200).json({
      message: "File uploaded and made public!",
      fileId: fileData.id,
      fileName: fileData.name,
      viewLink: `https://drive.google.com/file/d/${fileData.id}/view`,
      downloadLink: `https://drive.google.com/uc?id=${fileData.id}&export=download`,
    });
  } catch (error) {
    await deleteLocalFile(filePath);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
};

exports.listFilesController = async (req, res) => {
  try {
    const files = await listFiles(folderId);
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Failed to list files", error: error.message });
  }
};

exports.downloadFileController = async (req, res) => {
  try {
    const fileStream = await downloadFile(req.params.fileId);
    fileStream.data.pipe(res);
  } catch (error) {
    res.status(500).json({ message: "Failed to download file", error: error.message });
  }
};

exports.deleteFileController = async (req, res) => {
  try {
    await deleteFile(req.params.fileId);
    res.status(200).json({ message: "File deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete file", error: error.message });
  }
};

module.exports = exports;

































// // routes/fileRoutes.js
// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { uploadFile, setFilePermissions, listFiles, downloadFile, deleteFile } = require("../services/driveService");

// const router = express.Router();

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

// const deleteLocalFile = (filePath) => {
//   return new Promise((resolve, reject) => {
//     fs.unlink(filePath, (err) => {
//       if (err) return reject(err);
//       resolve();
//     });
//   });
// };

// const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";
// const domain = "mail.jiit.ac.in";

// // Upload a file
// router.post("/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file found!" });

//   const filePath = path.join(uploadDir, req.file.filename);
//   try {
//     const fileData = await uploadFile(req.file, folderId);
//     await setFilePermissions(fileData.id, domain);
//     await deleteLocalFile(filePath);

//     res.status(200).json({
//       message: "File uploaded and made public!",
//       fileId: fileData.id,
//       fileName: fileData.name,
//       viewLink: `https://drive.google.com/file/d/${fileData.id}/view`,
//       downloadLink: `https://drive.google.com/uc?id=${fileData.id}&export=download`,
//     });
//   } catch (error) {
//     await deleteLocalFile(filePath);
//     res.status(500).json({ message: "Failed to upload file", error: error.message });
//   }
// });

// // List files
// router.get("/files", async (req, res) => {
//   try {
//     const files = await listFiles(folderId);
//     res.status(200).json(files);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to list files", error: error.message });
//   }
// });

// // Download a file
// router.get("/download/:fileId", async (req, res) => {
//   try {
//     const fileStream = await downloadFile(req.params.fileId);
//     fileStream.data.pipe(res);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to download file", error: error.message });
//   }
// });

// // Delete a file
// router.delete("/delete/:fileId", async (req, res) => {
//   try {
//     await deleteFile(req.params.fileId);
//     res.status(200).json({ message: "File deleted successfully!" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to delete file", error: error.message });
//   }
// });

// module.exports = router;
