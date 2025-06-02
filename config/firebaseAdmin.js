const admin = require("firebase-admin");
// const serviceAccount = require("../jprep-2025-0ca2cf0f30df.json");
// const serviceAccount = require("../firebaseService.json");
//const serviceAccount = require("../jprep2025.json");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),  // Replace literal \n with actual newlines
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;