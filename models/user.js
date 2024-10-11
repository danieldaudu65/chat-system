const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, minlength: 3, maxlength: 10 },
    email: String,
    phoneNumber: String,
    department: String,
    faculty: String,
    password: String,
    image: String,
    otp: String,
    otpTime: Date,
    is_online: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, { 
    timestamps: true, 
    collection: 'user' 
});

module.exports = mongoose.model('user', userSchema);
