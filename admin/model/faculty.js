const mongoose = require('mongoose');

// Define Department Schema
const departmentSchema = new mongoose.Schema({
    name: String,
});

// Define Faculty Schema
const facultySchema = new mongoose.Schema({
    uniqueId: String,
    name: String,
    description: String,
    departments: [departmentSchema],  
    date: { type: Date, default: Date.now }
}, { collection: 'faculty' });

module.exports = mongoose.model('Faculty', facultySchema);
