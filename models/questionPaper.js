const mongoose = require("mongoose");


const questionPaperSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    code: {
        type: String,
        required: true,
        trim: true,
    },

    term: {
        type: String,
        required: true,
        trim: true,
    },

    year: {
        type: String,
        required: true,
        trim: true,
    },

    fileId: {
        type: String,
        required: true,
        trim: true,
    },

    fileName: {
        type: String,
        required: true,
        trim: true,
    },

    viewLink: {
        type: String,
        required: true,
        trim: true,
    },

    downloadLink: {
        type: String,
        required: true,
        trim: true,
    },

    contributor: {
        type: String,
        required: true,
    },

    score: {
        type: String,
        required: true,
        trim: true,
    },

    verified: {
        type: Boolean,
        required: true,
        default: false, 
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});


module.exports = mongoose.model("questionPaper", questionPaperSchema);
