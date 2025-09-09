const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createError } = require('../utils/errors');
const logger = require('../utils/logger');

const JWT_SECRET = (() => {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set');
    }
    return process.env.JWT_SECRET || 'dev_secret';
})();

const AUTH_DEBUG = process.env.LOG_AUTH === '1' || process.env.LOG_AUTH === 'true';

exports.authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw createError(401, 'NO_TOKEN', 'No token');
        }

        const token = authHeader.split(' ')[1];
    if (!token) throw createError(401, 'INVALID_TOKEN', 'Invalid token');

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err && err.name === 'TokenExpiredError') {
                throw createError(401, 'TOKEN_EXPIRED', 'Token expired');
            }
            throw createError(401, 'INVALID_TOKEN', 'Invalid token');
        }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) throw createError(401, 'USER_NOT_FOUND', 'User not found');
        if (user.role && typeof user.role === 'string') {
            user.role = user.role.toLowerCase();
        }
        req.user = user;

    if (roles.length && !roles.includes(user.role)) {
        throw createError(403, 'FORBIDDEN', 'Forbidden');
    }

        next();
    };
};

exports.isEdit = async (req, res, next) => {
    if (req.user.role === 'admin' || req.user._id.toString() === req.params.id) {
        return next();
    }
    if (req.user.role === 'librarian') {
        const targetUser = await User.findById(req.params.id);
        if (targetUser && targetUser.role === 'reader') return next();
    }
    throw createError(403, 'FORBIDDEN', 'Forbidden');
};