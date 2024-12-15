// Import required modules
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require("openai");
const dotenv = require('dotenv');
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_API_KEY,
});

// Initialize the app
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files in the uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Use a unique timestamp-based filename
    },
});
// Configure multer to use memory storage

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'text/plain') {
            return cb(new Error('Only .txt files are allowed!')); // Restrict file types to .txt
        }
        cb(null, true);
    },
});

// Endpoint to handle file uploads
app.post('/api/postdata', upload.single('file'), (req, res) => {
    // Ensure the file exists
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
    }

    const filePath = req.file.path; // Path to the uploaded file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Failed to process the file.' });
        }

        // Parse the file content into an array of tweets with keywords
        const tweets = data.split('\n').map(line => line.trim()).filter(line => line).map(tweet => {
            return {
                tweet: tweet
            };
        });

        // Respond with the tweets and their keywords
        res.json({ tweets });
    });
});



// Endpoint to handle guide requests
app.post('/api/guide', async (req, res) => {
    try {
        const { tweet } = req.body;

        if (!tweet) {
            return res.status(400).json({ error: "No tweet content provided" });
        }

        const prompt = `Tweet: ${tweet}\n\nInstructions: Check the authenticity of the tweet, and provide a response in the following JSON format:\n\n{\n  "authentic": "Misinformation/Disinformation/True",\n  "fact_check": "The tweet is authentic because...",\n  "fact_check_defence": "You can go through the following references...",\n  "todo": "You can Report/ignore/take legal action against the post...",\n  "counter_tweet": "The claim about ...., is completely false because ..... #factcheck #wrong #notauthentic etc"\n}`;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
        });

        // Extract and parse the content from the OpenAI response
        let rawContent = response.choices[0]?.message?.content?.trim();

        if (!rawContent) {
            throw new Error("No content received from the OpenAI API.");
        }
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(rawContent);
        } catch (error) {
            console.error("Error parsing OpenAI response:", error);
            return res.status(500).json({ error: "Failed to parse AI response" });
        }

        const sanitizedTweet = tweet.replace(/^\d+\.\s*/, '');

        // Add the sanitized tweet to the response
        parsedResponse.old_tweet = sanitizedTweet;
        res.json(parsedResponse);
    } catch (error) {
        console.error("Error handling /api/guide request:", error);
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});


// Serve the frontend files
app.use('/', express.static(path.join(__dirname, '../frontend/')));

// Create the uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
