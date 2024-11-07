const express = require('express')
const user = require('../models/user');
const { Jwt } = require('jsonwebtoken');
// const user = require('../models/user');
const route = express.Router()



route.get('/all-users', async (req, res) => {
    const { page, rows } = req.body;
    const skip = (page - 1) * rows;

    try {
        // Get the total count of users
        const totalUsers = await user.countDocuments();

        // Fetch users with pagination
        const all_users = await user.find({}).select('-password -otp -otpTime')
            .skip(skip)
            .limit(Number(rows));

        // Check if users exist
        if (all_users.length === 0) {
            return res.status(404).send({ status: 'fail', msg: 'No users available in the database' });
        }

        // Send paginated users data
        res.status(200).send({
            status: true,
            msg: `Page ${page} of users retrieved successfully`,
            totalUsers,
            totalPages: Math.ceil(totalUsers / rows), // Calculate total pages based on users per page
            currentPage: Number(page),
            users: all_users
        });
    } catch (error) {
        console.error('Error fetching users', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


// Updated route to include optional search functionality
route.get('/departmental-friend', async (req, res) => {
    const { department, token, page = 1, rows = 5, search } = req.body;

    // Validate input
    if (!token) {
        return res.status(400).send('Please provide a valid token');
    }
    if (!department) {
        return res.status(400).send("Please provide a valid department");
    }

    try {
        // Token validation
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_PASS);
        const currentUser = await user.findById(decoded._id);

        // Check if the user exists
        if (!currentUser) {
            return res.status(400).send({ status: 'Fail', msg: 'User not found' });
        }

        // Pagination setup
        const skip = (page - 1) * rows;

        // Build the query
        const query = {
            department,
            _id: { $ne: currentUser._id }
        };

        // If a search term is provided, add it to the query
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // 'i' for case-insensitive search
        }

        // Count total users in the department with the applied search filter
        const totalUsersInDept = await user.countDocuments(query);

        // Get users in the same department with pagination, excluding the current user
        const departmentUsers = await user.find(query)
            .skip(skip)
            .limit(Number(rows))
            .select('-password -otp -otpTime');

        if (departmentUsers.length === 0) {
            return res.status(404).send({ status: 'Fail', msg: 'No users found in the same department' });
        }

        // Send paginated and optionally filtered department users data
        res.status(200).send({
            status: true,
            msg: `Page ${page} of users in department retrieved successfully`,
            totalUsersInDept,
            totalPages: Math.ceil(totalUsersInDept / rows),
            currentPage: Number(page),
            users: departmentUsers
        });
    } catch (error) {
        console.error('Error fetching department users', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});


module.exports = route