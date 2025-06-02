const mongoose = require("mongoose")

// Define the  schema
const subjectSchema = new mongoose.Schema({

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

    department:{
        type:String,
        required: true,
        trim: true,
    },

    questionMaterial:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "questionPaper",
        },
    ],

    solutionMaterial:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "solution",
        },
    ]
  
})

// Export the  model
module.exports = mongoose.model("Subject", subjectSchema)
