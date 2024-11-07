const express = require('express');
const mongoose = require('mongoose');
const Faculty = require('../model/faculty'); // Assumes you have a Faculty model file in the models directory
const faculty = require('../model/faculty');
const Counter = require('../../models/count,');
const router = express.Router();

// Add a new Faculty
router.post('/add-faculty', async (req, res) => {
    const { name, description, departments } = req.body;

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: 'facultyId' },
            { $inc: { count: 1 } }, // Increment the count by 1
            { new: true, upsert: true } // Create if it doesn't exist
        );

        const uniqueId = `AAUF-${counter.count.toString().padStart(3, '0')}`;

        const newFaculty = new Faculty({
            name,
            description,
            departments: departments || [],
            uniqueId,
        });

        await newFaculty.save();

        res.status(201).send({ message: 'Faculty added successfully', faculty: newFaculty });
    }

    catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Get all faculties
router.get('/faculties', async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.status(200).send({ faculties });
    } catch (error) {
        console.error('Error fetching faculties:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Get all departments in a specific faculty by faculty ID
router.get('/faculty/departments', async (req, res) => {
    const { id } = req.body;

    try {
        const faculty = await Faculty.findOne({ uniqueId: id });
        if (!faculty) {
            return res.status(404).send({ message: 'Faculty not found' });
        }

        res.status(200).send({ departments: faculty.departments });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});


// Add a department to a specific faculty
router.post('/faculty/add-department', async (req, res) => {
    const { id , name } = req.body;


    try {
        const faculty = await Faculty.findOne({uniqueId: id});
        if (!faculty) {
            return res.status(404).send({ message: 'Faculty not found' });
        }

        // Add the new department to the faculty's departments array
        faculty.departments.push({ name });
        await faculty.save();

        res.status(201).send({ message: 'Department added successfully', faculty });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});   


// Get a specific faculty by ID
router.get('/single-faculty', async (req, res) => {
    const { id } = req.body;

    try {
        const faculty = await Faculty.findOne({ uniqueId: id });
        if (!faculty) {
            return res.status(404).send({ message: 'Faculty not found' });
        }

        res.status(200).send({ faculty });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Endpoint to delete a faculty
router.delete('/delete-faculty', async (req, res) => {
    const { id } = req.body
    try {
        // console.log(id);
        
        const deleteFaculty = await faculty.findOneAndDelete({uniqueId: id })
        

        // if faculty passed by the body isnt in the database
        if (!deleteFaculty) {
            return res.status(400).send({ success: false, message: "Faculty not Found" })
        }

        res.status(200).send({ success: true, message: 'Faculty deleted succesfully' })
    }
    catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
})

module.exports = router;
