const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

// Generate token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// Registration
exports.register = async (req, res) => {
    try {
        const { username, password, lastName, firstName, middleName, address, phone, discountCategory } = req.body;
        
        // Unique username validation
        const exists = await User.findOne({ username });
        if (exists) return res.status(400).json({ message: "Username already taken" });

        const user = new User({ username, password, role: "reader", lastName, firstName, middleName, address, phone, discountCategory });

        await user.save();

        const token = generateToken(user);

        res.status(201).json({ message: "User registered", token, role: user.role });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid data" });

    const token = generateToken(user);

    res.json({
        token,
        role: user.role
    });
};