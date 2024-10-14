const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, minlength: 3, maxlength: 10 },
    email: String,
    firstName: { type: String, minlength: 3, maxlength: 10 }, // First name
    surname: { type: String, minlength: 3, maxlength: 10 },   // Surname
    DOB: { type: Date }, 
    phoneNumber: String,
    department: String,
    faculty: String,
    password: String,
    pin: String,
    image: String,
    image_id: String,
    otp: String,
    otpTime: Date,
    is_online: { type: Boolean, default: false },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true,
    collection: 'user'
});

module.exports = mongoose.model('user', userSchema);
