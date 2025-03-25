const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    studentName: String,
    studentRollNumber: String,
    fileHash: String,
    marksheetFileName: String,  // Change "marksheet" to "marksheetFileName" to match the controller
    registrationNo: String,
    department: String,
});

const Document = mongoose.model('Document', documentSchema, 'Documents'); // Use correct schema

module.exports = Document;
