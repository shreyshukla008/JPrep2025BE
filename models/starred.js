const mongoose = require("mongoose")

// Define the  schema
const starredSchema = new mongoose.Schema({
  subject:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },

  createdAt:{
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 5 * 30
  }
})

// Export the  model
module.exports = mongoose.model("starred", starredSchema)
