const multer = require('multer');
const path = require('path');
const Document = require('../models/MarksheeModel'); // Ensure your model is imported correctly

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Specify upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Rename the file to avoid conflicts
    },
});

// Configure multer
const upload = multer({ storage: storage });

const uploadMarksheet = async (req, res) => {
    try {
        // Access form data from req.body
        const { studentName, studentRollNumber, registrationNo, department } = req.body;
        const fileHash = req.body.fileHash;

        console.log("Form Data Received:");
        console.log('Student Name:', studentName);
        console.log('Student Roll Number:', studentRollNumber);
        console.log('Registration No:', registrationNo);
        console.log('Department:', department);
        console.log('File Hash:', fileHash);

        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'No file was uploaded.' });
        }

        // Accessing the uploaded marksheet file
        const marksheet = req.file; // Use req.file instead of req.files for single file upload

        // Save document information to MongoDB
        const newDocument = new Document({
            studentName,
            studentRollNumber,
            fileHash,
            marksheetFileName: marksheet.filename, // Save the original filename
            registrationNo,
            department,
        });

        await newDocument.save();

        res.status(201).json({ message: 'Marksheet uploaded successfully.' });
    } catch (error) {
        console.error('Error saving document:', error);
        res.status(500).json({ message: 'Error saving document.', error: error.message });
    }
};

// Export the middleware with multer
module.exports = { uploadMarksheet, upload };
