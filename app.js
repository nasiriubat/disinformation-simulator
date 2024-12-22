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


const storage = multer.memoryStorage();

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

    try {
        // Convert file buffer to a string
        const fileContent = req.file.buffer.toString('utf-8');

        // Parse the file content into an array of tweets
        const tweets = fileContent
            .split('\n') // Split into lines
            .map(line => line.trim()) // Remove leading/trailing whitespace
            .filter(line => line) // Filter out empty lines
            .map(tweet => ({ tweet })); // Map each line into an object with a 'tweet' key

        // Respond with the parsed tweets
        res.json({ tweets });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to process the file.' });
    }
});

app.post('/api/generate-tweet', async (req, res) => {
    const { query } = req.body;
    const { tweetCount } = req.body;

    // Ensure the file exists
    if (!query && !tweetCount) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const prompt = `
        Generate ${tweetCount} tweets on the topic "${query}", can be True, Misinformation, or Disinformation. 
        Provide the response in the following format:

        "1. Elon Musk loses in Tesla due to poor management decisions and plummeting stock prices #elonTesla #teslaShare #stock #bignews etc",
        "2. Rumors circulating that Elon Musk is stepping down as CEO of Tesla after financial struggles #finance #news #wow etc" 
         `;

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 700,
        });

        // Extract the content from OpenAI response
        let rawContent = response.choices[0]?.message?.content?.trim();

        if (!rawContent) {
            throw new Error("No content received from the OpenAI API.");
        }

        let parsedTweets;
        try {
            console.log('Attempting to parse response as JSON.');
            // If OpenAI returned JSON-like output, parse it
            parsedTweets = JSON.parse(rawContent).tweets.map((tweet, index) => ({
                tweet: `${index + 1}. "${tweet}"`,
            }));
        } catch (error) {
            console.warn('Response is not valid JSON. Proceeding with manual parsing.');

            // Manual parsing for plain text output
            parsedTweets = rawContent
                .split('\n') // Split into lines
                .map(line => line.trim()) // Trim whitespace
                .filter(line => line.match(/^\d+\.\s/)) // Keep only lines starting with numbers
                .map((line) => ({
                    tweet: line, // Use the original line directly
                }));
        }

        if (!parsedTweets || parsedTweets.length === 0) {
            throw new Error('Parsed response is invalid.');
        }

        res.json({"tweets":parsedTweets}); // Send the structured response
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'Failed to generate tweets.' });
    }
});

app.get('/api/sampledata', (req, res) => {
    const filePath = path.join(__dirname, 'tweets.txt'); // Path to the tweets.txt file

    // Read the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading sample data file:', err);
            return res.status(500).json({ error: 'Failed to load sample data.' });
        }

        // Parse the file content into an array of tweets
        const tweets = data
            .split('\n') // Split into lines
            .map(line => line.trim()) // Trim leading/trailing whitespace
            .filter(line => line) // Remove empty lines
            .map(tweet => ({ tweet })); // Map each line to an object with 'tweet'

        res.json({ tweets }); // Respond with the parsed tweets
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
            // model: "gpt-4",
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 500,
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
app.use('/', express.static(path.join(__dirname, './frontend/')));

// Create the uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
