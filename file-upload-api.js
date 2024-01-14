const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB ------------------------------------
mongoose.connect('mongodb://localhost:27017/fileUploadDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a file schema for storing metadata ------------------
const fileSchema = new mongoose.Schema({
    filename: String,
    uploadDate: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

// Multer configuration for handling file uploads ------------
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());

// API endpoint for file upload ----------
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Save metadata to the database
        const newFile = new File({ filename: req.file.originalname });
        await newFile.save();

        // Return fileId in the response
        return res.json({ fileId: newFile._id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
