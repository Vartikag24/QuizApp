const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    //with auth
    _userId:{
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = { Quiz }