const mongoose = require("mongoose")

// Define the  schema
const solutionSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
        trim: true,
    },

    code:{
        type:String,
        required: true,
        trim: true,
    },

    term:{
        type:String,
        required: true,
        trim: true,
    },

    year:{
        type:String,
        required: true,
        trim: true,
    },

    fileId:{
        type: String,
        require: true,
        trim: true
    },

    fileName:{
        type: String,
        require: true,
        trim: true
    },

    viewLink:{
        type: String,
        require: true,
        trim: true
    },

    downloadLink:{
        type: String,
        require: true,
        trim: true
    },

    contributors:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },

    createdAt:{
        type: Date,
        default: Date.now
    }
})

// Export the  model
module.exports = mongoose.model("solution", solutionSchema)
