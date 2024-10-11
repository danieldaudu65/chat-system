const mongoose = require('mongoose');

// Define Department Schema
const departmentSchema = new mongoose.Schema({
    name: String,
    levels: [String],  
});

// Define Faculty Schema
const facultySchema = new mongoose.Schema({
    name: String,
    description: String,
    departments: [departmentSchema],  
    date: { type: Date, default: Date.now }
}, { collection: 'faculty' });

module.exports = mongoose.model('Faculty', facultySchema);
