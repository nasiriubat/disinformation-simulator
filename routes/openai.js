const express = require('express');
const { OpenAI } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
const db = require('../database/db');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

// Generate Disinformation
router.post('/generate-disinformation', async (req, res) => {
    const { topic, strategy } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use 'gpt-4' if you want the GPT-4 model
            messages: [
                {
                    role: 'system',
                    content: 'You are a narrative strategist helping to create engaging disinformation.',
                },
                {
                    role: 'user',
                    content: `Generate a disinformation narrative on the topic: "${topic}" using the strategy: "${strategy}". Make it engaging and impactful.`,
                },
            ],
            max_tokens: 150,
        });

        const generatedText = response.choices[0]?.message?.content?.trim();

        // Log to the database
        const sql = `INSERT INTO actions (team, action, round) VALUES (?, ?, ?)`;
        db.run(sql, ['Red', generatedText, 1], function (err) {
            if (err) {
                console.error('Error logging disinformation:', err.message);
                return res.status(500).send('Error logging disinformation.');
            }
        });

        res.json({ disinformation: generatedText });
    } catch (error) {
        console.error('Error generating disinformation:', error.message);
        res.status(500).send('Error generating disinformation.');
    }
});

// Generate Counter Narrative
router.post('/generate-counter-narrative', async (req, res) => {
    const { disinformation } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Use 'gpt-4' for more advanced responses
            messages: [
                {
                    role: 'system',
                    content: 'You are a fact-checking expert creating counter-narratives to disinformation.',
                },
                {
                    role: 'user',
                    content: `Counter the following disinformation narrative with factual, compelling, and persuasive language: "${disinformation}".`,
                },
            ],
            max_tokens: 150,
        });

        const generatedText = response.choices[0]?.message?.content?.trim();

        // Log to the database
        const sql = `INSERT INTO actions (team, action, round) VALUES (?, ?, ?)`;
        db.run(sql, ['Blue', generatedText, 1], function (err) {
            if (err) {
                console.error('Error logging counter-narrative:', err.message);
                return res.status(500).send('Error logging counter-narrative.');
            }
        });

        res.json({ counterNarrative: generatedText });
    } catch (error) {
        console.error('Error generating counter-narrative:', error.message);
        res.status(500).send('Error generating counter-narrative.');
    }
});

module.exports = router;