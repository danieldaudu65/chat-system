const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const route = express.Router();
const User = require('../models/user');
const Faculty = require('../models/faculty');
const sendOTP = require('../utils/nodemailer');

// Sign up Endpoint for the chat
route.post('/signup', async (req, res) => {
    const { username, email, phoneNumber, department, faculty, password } = req.body;

    try {
        // Check if all the required fields were provided
        if (!username || !email || !phoneNumber || !department || !faculty || !password) {
            return res.status(400).send({ msg: 'Please fill all the required fields' });
        }

        // Check if the email is valid
        const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailCheck.test(email)) {
            return res.status(400).send({ msg: 'Please use a valid email address' });
        }

        // Check if the password is valid
        const passwordCheck = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
        if (!passwordCheck.test(password)) {
            return res.status(400).send({ msg: 'Password must be at least 8 characters long and include at least one letter, one number, and one special character.' });
        }

        // Validate phone number
        const phoneNumberCheck = /^\+234\d{10}$/;
        if (!phoneNumberCheck.test(phoneNumber)) {
            return res.status(400).send({ msg: 'Please use a valid phone number with the format +234XXXXXXXXXX' });
        }

        // Check if the faculty is valid
        const validFaculty = await Faculty.findOne({ name: faculty });
        if (!validFaculty || !validFaculty.departments.includes(department)) {
            return res.status(400).send({ msg: 'The provided department does not belong to a valid faculty' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ msg: 'User with this email already exists' });
        }

        // Check if the username already exists
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).send({ msg: 'Username already exists' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiration = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

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

        // Send OTP to user's email
        sendOTP(email, otp);

        res.status(201).send({ msg: 'User created successfully. An OTP has been sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ msg: 'Server error' });
    }
});

route.post('/verify-otp', async (req, res) => {
    const { otp } = req.body
    try {
        if (!otp) {
            res.status(400).send({ status: false, msg: 'Please fill in the OTP Box' })
        }

        const user = User.findOne({ otp })

        if (!user) {
            res.status(400).send({ status: false, msg: 'User does not Exist Please Sign Up' })
        }

        if (user.otp !== otp || user.otpTime < Date.now()) {
            user.otp = null;
            user.otpTime = null;
            await user.save();

            return res.status(400).send({ status: 'Invalid or  OTP' });
        }
        // When the OTP is correct and not yet expired
        user.otp = null;
        user.otpTime = null;
        await user.save();

        res.status(200).send({ status: 'OTP verified successfully' });
    }
    catch (error) {
        console.error('Error during OTP verification:', error);
        res.status(500).send({ status: 'Internal Server Error', msg: error.message });
    }
})


route.post('/login', async (req, res) => {
    const { username, password } = req.body

    try {
        if (!username || !password) {
            res.status(400).send({ status: false, msg: 'All filed must be Filled' })
        }

        const user = User.findOne({ username })
        if (!user) {
            res.status(404).send({ status: false, msg: 'User does not exist' })
        }

        const passwordCheck = await bcrypt.compare(password, user.password)

        if (!cPassword) {
            return res.status(401).send({ status: 'Incorrect details' });
        }

        // generatejwt token
        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_TOKEN_PASS)

        // update user
        await user.save();
        res.status(200).send({ status: 'Login successful', user, token })
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ status: 'Internal Server Error' });
    }
})
module.exports = route;
