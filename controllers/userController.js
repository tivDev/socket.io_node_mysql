const db = require('../models/db');

exports.getUsers = (req, res) => {
    db.query('SELECT name FROM user', (err, results) => {
        if (!err) {
            res.json(results);
        } else {
            res.status(500).json({ error: 'Database error' });
        }
    });
};

exports.createUser = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    db.query('INSERT INTO user (name) VALUES (?)', [name], (err) => {
        if (!err) {
            res.json({ message: 'User created successfully' });
        } else {
            res.status(500).json({ error: 'Database error' });
        }
    });
};
