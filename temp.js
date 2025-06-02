const express = require("express");
const { google } = require("googleapis");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path")
const database = require("./config/database");

dotenv.config(); // Load environment variables

const app = express();
const PORT = 4000;
// Connecting to database
database.connect();

// ✅ Configure Google Drive API with Service Account (No Manual Token Needed)
const auth = new google.auth.GoogleAuth({
  keyFile: "jprep-2025-0ca2cf0f30df.json", // Path to your service account key
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });


const uploadDir = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  }
});

// File filter to allow only certain types of files (doc, pdf, jpeg, jpg)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/msword", "image/jpeg", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, JPEG, and JPG files are allowed."), false);
  }
};

// Middleware for file upload
const upload = multer({ 
                      storage: storage,
                      fileFilter: fileFilter,
                      limits: { fileSize: 3 * 1024 * 1024 }
                    }); // 3mb file size

// ✅ 1. Upload File to Google Drive (No Need for Manual Token)

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded!" });
//     }

//     const fileMetadata = {
//       name: req.file.originalname,
//     };

//     const media = {
//       mimeType: req.file.mimetype,
//       body: fs.createReadStream(req.file.path),
//     };

//     const response = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id, name",
//     });

//     fs.unlinkSync(req.file.path); // ✅ Delete local file after upload
//     console.log("Uploaded file path:", req.file.path);

//     res.json({
//       message: "File uploaded successfully!",
//       fileId: response.data.id,
//       fileName: response.data.name,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   try {
//     const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0"; // Your Folder ID

//     const fileMetadata = {
//       name: req.file.originalname,
//       parents: [folderId], // Upload to the specific folder
//     };

//     const media = {
//       mimeType: req.file.mimetype,
//       body: fs.createReadStream(req.file.path),
//     };

//     const file = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id, name, parents",
//     });

//     res.status(200).json({
//       message: "File uploaded successfully!",
//       fileId: file.data.id,
//       fileName: file.data.name,
//       folderId: file.data.parents ? file.data.parents[0] : null,
//     });

//     console.log("File uploaded to folder:", file.data.parents[0]);
//   } catch (error) {
//     console.error("Error uploading file to Drive:", error.message);
//     res.status(500).json({ message: "File upload failed", error: error.message });
//   }
// });

// Upload a file and set its permissions
app.post("/upload", upload.single("file"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ message: "No file found!" });
  }

  const filePath = path.join(__dirname, "uploads", req.file.filename);

  try {
    const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";

    const fileMetadata = {
      name: req.file.originalname,
      parents: [folderId], // Upload to this folder
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    // Upload the file to Google Drive
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, name, parents",
    });

    // Set file permissions to public
    await drive.permissions.create({
      fileId: file.data.id,
      requestBody: {
        role: "reader",
        type: "domain",
        domain: "mail.jiit.ac.in",
      },
    });

    await deleteLocalFile(filePath);

    // Return view and download links
    res.status(200).json({
      message: "File uploaded and made public!",
      fileId: file.data.id,
      fileName: file.data.name,
      folderId: file.data.parents ? file.data.parents[0] : null,
      viewLink: `https://drive.google.com/file/d/${file.data.id}/view`,
      downloadLink: `https://drive.google.com/uc?id=${file.data.id}&export=download`,
    });
  } catch (error) {
    console.error("Error uploading file:", error.message);
    await deleteLocalFile(filePath);
    res.status(500).json({ message: "Failed to upload file", error: error.message });
  }
});

// Helper function to delete a file
const deleteLocalFile = (filePath) => {
  return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
          if (err) {
              console.error("Failed to delete local file:", err.message);
              return reject(err);
          }
          console.log(`Local file deleted: ${filePath}`);
          resolve();
      });
  });
};






app.get("/", (req, res) => {
  res.send("Server is running!");
});



// ✅ 2. List Files

// app.get("/files", async (req, res) => {
//   try {
//     const response = await drive.files.list({ fields: "files(id, name)" });
//     res.json(response.data.files);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// app.get("/files", async (req, res) => {
//   try {
//     const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";

//     const response = await drive.files.list({
//       q: `'${folderId}' in parents`, // Search within the folder
//       fields: "files(id, name)",
//     });

//     res.status(200).json(response.data.files);
//   } catch (error) {
//     console.error("Error listing files:", error.message);
//     res.status(500).json({ message: "Failed to list files", error: error.message });
//   }
// });

app.get("/files", async (req, res) => {
  try {
    const folderId = "1-oyGcR9cg3-F2_uE7ymRBNg-GKhZnGN0";

    const response = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: "files(id, name, webViewLink, webContentLink)",
    });

    const files = response.data.files.map((file) => ({
      name: file.name,
      viewLink: `https://drive.google.com/file/d/${file.id}/view`, // View in browser
      downloadLink: `https://drive.google.com/uc?id=${file.id}&export=download`, // Direct download
    }));

    res.status(200).json(files);
  } catch (error) {
    console.error("Error listing files:", error.message);
    res.status(500).json({ message: "Failed to list files", error: error.message });
  }
});



// ✅ 3. Download File

// app.get("/download/:id", async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     const dest = fs.createWriteStream(`downloads/${fileId}.pdf`);

//     const response = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });

//     response.data.pipe(dest).on("finish", () => {
//       res.download(`downloads/${fileId}.pdf`, () => {
//         fs.unlinkSync(`downloads/${fileId}.pdf`); // Delete after download
//       });
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


app.get("/download/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    const file = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    file.data.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error.message);
    res.status(500).json({ message: "Failed to download file", error: error.message });
  }
});


// ✅ 4. Delete File

// app.delete("/delete/:id", async (req, res) => {
//   try {
//     const fileId = req.params.id;
//     await drive.files.delete({ fileId });
//     res.json({ message: "File deleted successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


app.delete("/delete/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    await drive.files.delete({ fileId });

    res.status(200).json({ message: "File deleted successfully!" });
  } catch (error) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ message: "Failed to delete file", error: error.message });
  }
});



// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
