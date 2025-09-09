const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require('../utils/errors');

const JWT_SECRET = (() => {
    if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must be set in production');
        return 'supersecret123';
    }
    return process.env.JWT_SECRET;
})();

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
};

exports.register = async (req, res) => {
    let { username, password, lastName, firstName, middleName, address, phone, discountCategory } = req.body;
    username = (username || '').trim();
    const exists = await User.findOne({ username });
    if (exists) throw createError(400, 'USERNAME_TAKEN', 'Username already taken');
    const user = new User({ username, password, role: 'reader', lastName, firstName, middleName, address, phone, discountCategory });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ message: 'User registered', token, role: user.role });
};

exports.login = async (req, res) => {
    let { username, password } = req.body;
    username = (username || '').trim();
    const user = await User.findOne({ username });
    if (!user) throw createError(400, 'INVALID_CREDENTIALS', 'Invalid credentials');
    let isMatch = false;
    try {
        isMatch = await user.comparePassword(password);
    } catch (e) { isMatch = false; }
    if (!isMatch) throw createError(400, 'INVALID_CREDENTIALS', 'Invalid credentials');
    const token = generateToken(user);
    res.json({ token, role: user.role });
};