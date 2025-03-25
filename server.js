const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const documentsRoutes = require('./routes/documentsRoutes');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api/documents', documentsRoutes);

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/Blockchain'; 
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// User schema and model for the Users collection
const userSchema = new mongoose.Schema({
  Username: String,
  Password: String,
});

const User = mongoose.model('User', userSchema, 'Users');

// Pinata API credentials
const PINATA_API_KEY = 'ca6f527e731b295e1288';
const PINATA_API_SECRET = '1cea24fd0a03b66cb2fb173abc774d69bc53b679ce064b816d6aa7dc6138218e';
const PINATA_BASE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Login route
app.post('/myapp/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ Username: username });

    if (!user || user.Password !== password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    return res.status(200).json({ username: user.Username });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Document schema and model for storing document metadata in MongoDB
const documentSchema = new mongoose.Schema({
  studentName: String,
  studentRollNumber: String,
  registrationNo: String,
  department: String,
  fileName: String,
  ipfsHash: String, // Save the IPFS hash
});

// Check if the model is already defined
const Document = mongoose.models.Document || mongoose.model('Document', documentSchema, 'Documents');

// Upload file to Pinata and save data
app.post('/api/documents/upload', upload.single('marksheet'), async (req, res) => {
  try {
    const { studentName, studentRollNumber, registrationNo, department } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const form = new FormData();
    form.append('file', file.path); 

    const pinataResponse = await axios.post(PINATA_BASE_URL, form, {
      headers: {
        ...form.getHeaders(),
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_API_SECRET,
      },
    });

    const ipfsHash = pinataResponse.data.IpfsHash;
    console.log('File uploaded to IPFS with hash:', ipfsHash);

    const newDocument = new Document({
      studentName,
      studentRollNumber,
      registrationNo,
      department,
      fileName: file.originalname,
      ipfsHash,
    });

    await newDocument.save();

    return res.status(200).json({
      message: 'Document uploaded successfully',
      ipfsHash,
    });
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return res.status(500).json({ message: 'Failed to upload to Pinata' });
  }
});

// Server start
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
