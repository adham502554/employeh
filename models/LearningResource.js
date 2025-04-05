const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['video', 'article', 'course', 'document'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LearningResource', learningResourceSchema); 