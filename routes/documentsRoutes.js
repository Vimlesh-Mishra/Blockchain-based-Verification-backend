const express = require('express');
const router = express.Router();
const { uploadMarksheet, upload } = require('../controllers/documentsController'); // Adjust the path as needed

// Use the upload middleware in the route
router.post('/upload', upload.single('marksheet'), uploadMarksheet);

module.exports = router;
