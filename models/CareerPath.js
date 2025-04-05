const mongoose = require('mongoose');

const careerPathSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    currentPosition: {
        type: String,
        required: true
    },
    nextPositions: [{
        position: String,
        requirements: [String],
        averageTime: String,
        salaryRange: {
            min: Number,
            max: Number
        }
    }],
    skills: [{
        name: String,
        level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced']
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CareerPath', careerPathSchema); 