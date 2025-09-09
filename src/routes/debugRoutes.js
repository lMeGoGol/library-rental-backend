const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123';

// Public dev-only: decode token and return payload or error without requiring auth middleware
router.get('/echo', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1] || null;
    if (!token) return res.status(200).json({ decoded: null, error: 'no_token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json({ decoded });
    } catch (e) {
        return res.status(200).json({ decoded: null, error: e && e.message, name: e && e.name });
    }
});

// Protected dev-only: return what auth middleware resolves as req.user
router.get('/me', authMiddleware(['admin','librarian','reader']), (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
