const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Get all scenarios
router.get('/', (req, res) => {
    const sql = `SELECT * FROM scenarios`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

// Add a new scenario
router.post('/', (req, res) => {
    const { name, complexity, description } = req.body;
    const sql = `INSERT INTO scenarios (name, complexity, description) VALUES (?, ?, ?)`;
    db.run(sql, [name, complexity, description], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(201).json({ id: this.lastID, name, complexity, description });
    });
});

module.exports = router;
