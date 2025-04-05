const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['employee', 'hr', 'admin'],
        default: 'employee'
    },
    department: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    leaveBalance: {
        type: Number,
        default: 20 // Default annual leave days
    },
    profile: {
        phone: String,
        address: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        }
    }
}, { timestamps: true });

// Hash password before saving
employeeSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
employeeSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema); 