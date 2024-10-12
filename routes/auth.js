const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // Missing import
const router = express.Router();
const User = require('../models/user');
// const Faculty = require('../models/faculty');
const sendOTP = require('../utils/nodemailer');
const { generateOTP, generateAlphanumericOTP } = require('../utils/generateOTP');

// Sign up Endpoint for the chat
router.post('/signup', async (req, res) => {
    const { username, email, phoneNumber, department, faculty, password } = req.body;

    try {
        // Check if all the required fields were provided
        if (!username || !email || !phoneNumber || !department || !faculty || !password) {
            return res.status(400).send({ message: 'Please fill all the required fields' });
        }

        // Check if the email is valid
        const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailCheck.test(email)) {
            return res.status(400).send({ message: 'Please use a valid email address' });
        }

        // Check if the password is valid
        const passwordCheck = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
        if (!passwordCheck.test(password)) {
            return res.status(400).send({ message: 'Invalid Password.' });
        }

        // Validate phone number
        const phoneNumberCheck = /^\+234\d{10}$/;
        if (!phoneNumberCheck.test(phoneNumber)) {
            return res.status(400).send({ message: 'Please use a valid phone number' });
        }

        // Check if the faculty is valid
        // const validFaculty = await Faculty.findOne({ name: faculty });
        // if (!validFaculty || !validFaculty.departments.includes(department)) {
        //     return res.status(400).send({ message: 'The provided department does not belong to a valid faculty' });
        // }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'User with this email already exists' });
        }

        // Check if the username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).send({ message: 'Username already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate OTP
        const { otp, otpExpiration } = generateOTP();
        await sendOTP(email, otp);

        // Proceed with user creation if all validations pass
        const newUser = new User({
            username,
            email,
            phoneNumber,
            department,
            faculty,
            password: hashedPassword,
            otp,
            otpTime: otpExpiration
        });

        await newUser.save();

        res.status(201).send({ message: 'User created successfully. An OTP has been sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        if (!otp) {
            return res.status(400).send({ status: false, message: 'Please fill in the OTP Box' });
        }

        const user = await User.findOne({ otp });
        if (!user) {
            return res.status(400).send({ status: false, message: 'User does not Exist. Please Sign Up' });
        }

        if (user.otp !== otp || user.otpTime < Date.now()) {
            user.otp = null;
            user.otpTime = null;
            await user.save();

            return res.status(400).send({ status: 'Invalid or expired OTP' });
        }
        // When the OTP is correct and not yet expired
        user.otp = null;
        user.otpTime = null;
        await user.save();

        res.status(200).send({ status: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).send({ status: 'Internal Server Error', message: error.message });
    }
});

router.post('/email-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).send({ status: false, message: 'All fields must be filled' });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ status: false, message: 'User does not exist' });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(401).send({ status: 'Incorrect details' });
        }

        // Generate JWT token
        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_TOKEN_PASS);

        // Update user
        await user.save();
        res.status(200).send({ status: 'Login successful', user, token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'Internal Server Error' });
    }
});
router.post('/number-login', async (req, res) => {
    const { number, password } = req.body;

    try {
        if (!number || !password) {
            return res.status(400).send({ status: false, message: 'All fields must be filled' });
        }

        const user = await User.findOne({ number });
        if (!user) {
            return res.status(404).send({ status: false, message: 'User does not exist' });
        }

        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) {
            return res.status(401).send({ status: 'Incorrect details' });
        }

        // Generate JWT token
        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_TOKEN_PASS);

        // Update user
        await user.save();
        res.status(200).send({ messages: 'Login successful', user, token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ status: 'Internal Server Error' });
    }
});

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).send({ status: false, message: 'Email field must be filled' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ status: false, message: 'User not found' });
        }

        const { otp, otpExpiration } = generateAlphanumericOTP();
        await sendOTP(email, otp);

        // Save OTP to the user
        user.otp = otp;
        user.otpTime = otpExpiration;
        await user.save();

        res.status(200).send({ status: true, message: 'OTP sent to email' });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).send({ status: false, message: 'Internal Server Error' });
    }
});


router.post('/change-password', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email and password are provided
        if (!password || !email) {
            return res.status(400).send({ status: false, message: 'Email and password fields must be filled' });
        }

        // Check if the user exists by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ status: false, message: 'User not found' });
        }
        const passwordCheck = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
        if (!passwordCheck.test(password)) {
            return res.status(400).send({ message: 'Invalid Password.' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).send({ status: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).send({ status: false, message: 'Internal Server Error' });
    }
})

// Export the routerr
module.exports = router;
