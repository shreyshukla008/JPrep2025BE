const mongoose = require("mongoose")
const starred = require("./starred")

// Define the  schema
const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        unique: true,
        trim: true,
        sparse: true,
      },

    role: {
        type: String,
        enum: ["Admin", "Student", "Instructor", "Owner", "Guest"],
        required: true,
    },

    uid: {
        type: String,
        trim: true,
        unique: true,
        sparse: true, // Firebase anonymous or Google UID
    },

    starred: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    token: {
        type: String,
    },

    createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, 
  },
  
});

userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { role: "Guest" } });

// Export the  model
module.exports = mongoose.model("user", userSchema)
