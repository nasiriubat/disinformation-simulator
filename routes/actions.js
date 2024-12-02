const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Log an action
router.post('/', (req, res) => {
    const { team, action, round } = req.body;
    const sql = `INSERT INTO actions (team, action, round) VALUES (?, ?, ?)`;
    db.run(sql, [team, action, round], function (err) {
        if (err) return res.status(500).send(err.message);
        res.status(201).json({ id: this.lastID, team, action, round });
    });
});

// Get all actions
router.get('/', (req, res) => {
    const sql = `SELECT * FROM actions`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});

module.exports = router;
