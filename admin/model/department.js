const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: String,
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    dateCreated: { type: Date, default: Date.now }
}, { collection: 'department' });

module.exports = mongoose.model('Department', departmentSchema);
