const admin = require("firebase-admin");
// const serviceAccount = require("../jprep-2025-0ca2cf0f30df.json");
// const serviceAccount = require("../firebaseService.json");
const serviceAccount = require("../jprep2025.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;