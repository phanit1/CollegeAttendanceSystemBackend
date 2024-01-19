// imported express
const express = require('express')
//created a router
const router = express.Router();
const userdata = require('./user');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await userdata.findOne({ username, password });

        if (user) {
            res.json({ role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await userdata.findOne({ username });

        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
        } else {
            // Create a new user
            const newUser = new userdata({ username, password, role });
            await newUser.save();
            res.json({ message: 'Registration successful' });
        }
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router
