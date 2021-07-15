const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    answers:{
        type: Array,
        required:true,
    },
    correctAns:{
        type: String,
        required: true,
        minlength: 1,
        trim: true

    },
    _quizId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const Question = mongoose.model('Question', QuestionSchema);

module.exports = { Question }