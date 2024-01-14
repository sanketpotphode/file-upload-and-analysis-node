const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { TextAnalyzer } = require('./textAnalyzer'); // Assuming you have a text analysis module

const app = express();
const port = 3000;

// Connect to MongoDB 
mongoose.connect('mongodb://localhost:27017/fileUploadDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Create a file schema for storing metadata
const fileSchema = new mongoose.Schema({
    filename: String,
    uploadDate: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());

// API endpoint for file upload
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

// API endpoint for text analysis task
app.post('/analyze/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { operation, options } = req.body;

        // Retrieve the text content from the file using fileId
        const file = await File.findById(fileId);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Perform text analysis based on the specified operation
        const text = getTextContentSomehow(); // Implement a function to get text content from the file
        const analyzer = new TextAnalyzer(text);

        let result;
        switch (operation) {
            case 'countWords':
                result = analyzer.countWords();
                break;
            case 'countUniqueWords':
                result = analyzer.countUniqueWords();
                break;
            case 'findTopKWords':
                const { k } = options;
                result = analyzer.findTopKWords(k);
                break;
            default:
                return res.status(400).json({ error: 'Invalid analysis operation' });
        }

        // Generate and return a unique taskId for tracking and retrieving results
        const taskId = generateUniqueTaskIdSomehow(); // Implement a function to generate unique task ID
        saveTaskResult(taskId, result); // Implement a function to save analysis results with taskId

        return res.json({ taskId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
