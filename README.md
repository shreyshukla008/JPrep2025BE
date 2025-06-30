# 📚 jPrep Backend

**jPrep** is a web application designed to help students and teachers manage and access Previous Year Question papers (PYQs) and their solutions. This backend powers all server-side functionality — including authentication, file uploads, OCR-based validation, and Google Drive integration.

---

## 🚀 Features

- 🔐 Role-based authentication for Students, Teachers, and Admins
- 📤 Upload and manage PYQs and their solutions
- 🧠 OCR-based validation to ensure accuracy and prevent duplication
- 📁 Google Drive integration using a single service account
- ⭐ Star subjects, assign confidence scores, and prevent invalid uploads
- ⏳ Automatic expiration of files after 3 years
- 🛡️ Secure API access using JWT and cookie-based session management

---

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js  
- **Database**: MongoDB + Mongoose  
- **Authentication**: Firebase ID Token + JWT  
- **OCR Engine**: Tesseract.js  
- **Cloud Storage**: Google Drive API  
- **Security**: Role middleware, file validation, cookie protection

---

## 📂 Project Structure

jprep-backend/
├── controllers/ # Route handlers and business logic
├── middlewares/ # JWT auth, role checks, error handling
├── models/ # Mongoose schemas for Users, Papers, Subjects, etc.
├── routes/ # API endpoints
├── utils/ # OCR helpers, Google Drive API wrappers
├── config/ # MongoDB, Firebase, and Drive setup
├── server.js # Main server entry point
├── .env # Environment variables (not tracked in repo)


---

## 🔐 Authentication Flow

1. Frontend uses Firebase to get a Google ID token
2. Backend verifies the token with Firebase Admin SDK
3. If user doesn’t exist, a new user is created
4. JWT is issued and sent via cookies for session-based authentication
5. Protected routes check for valid roles before granting access

---

## 🧠 OCR & Validation Flow

1. User uploads a scanned file (PDF/Image)
2. OCR is performed using **Tesseract.js**
3. Text is extracted and checked against existing entries
4. Confidence score is assigned
5. File is accepted or flagged for review based on results

---

## 🧪 API Overview

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| POST   | `/api/auth/google`        | Authenticate user via Firebase token |
| POST   | `/api/upload/paper`       | Upload a question paper              |
| POST   | `/api/upload/solution`    | Upload a solution file               |
| GET    | `/api/papers`             | Get list of papers by course/subject |
| GET    | `/api/solutions`          | Get solutions for selected papers    |
| DELETE | `/api/file/:fileId`       | Delete file from Drive and database  |

---

## 🔗 Related Repositories

- 🖥️ **Frontend Repository**  
  👉 [jPrep Frontend on GitHub](https://github.com/your-username/jprep-frontend)

---

## 📄 License

This project is open-source under the **MIT License**.  
Feel free to use, modify, or contribute with attribution.

---

## 🤝 Contributors

Built with ❤️ for learners, by leraner
