const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret123";

exports.authMiddleware = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Invalid token" });

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = User.findById(decoded.id);

        if (!req.user) return res.status(401).json({ message: "User not found" });

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
};

exports.isEdit = (req, res, next) => {
    if (req.user.role === "admin" || req.user._id.toString() === req.params.id) {
        return next();
    }

    if (req.user.role === "librarian") {
        const targetUser = User.findById(req.params.id);
        if (targetUser && targetUser.role === "reader") {
            return next();
        }
    }

    return res.status(403).json({ message: "Forbidden" });
};