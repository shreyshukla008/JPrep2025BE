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
        required: true,
        unique: true,
        trim: true,
      },
      
      password: {
        type: String,
        required: true,
        trim: true,
      },

    role: {
        type: String,
        enum: ["Admin", "Student", "Instructor"],
        required: true,
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
  
})

// Export the  model
module.exports = mongoose.model("user", userSchema)
