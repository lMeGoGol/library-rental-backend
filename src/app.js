const express = require("express");
const path = require('path');
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const C = require('./config/constants');

const bookRoutes = require("./routes/bookRoutes");
const userRoutes = require("./routes/userRoutes");
const loanRoutes = require("./routes/loanRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const logger = require('./utils/logger');
const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// General rate limiter
app.use(rateLimit({ windowMs: C.DEFAULT_RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX }));
app.use(cors({
    origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(','),
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json({ limit: C.JSON_BODY_LIMIT }));
// Tighter limiter for auth endpoints (brute-force mitigation)
app.use('/api/auth', rateLimit({ windowMs: C.AUTH_RATE_LIMIT_WINDOW_MS, max: C.AUTH_RATE_LIMIT_MAX }));
const authRoutes = require("./routes/authRoutes");

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/api/health", (req, res) => { res.json({ status: "ok" }); });

app.use("/api/books", bookRoutes);
app.use("/api/users", userRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/auth", authRoutes);

try {
    const swaggerUi = require('swagger-ui-express');
    const openapi = require('./docs/openapi.json');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));
    logger.info('app', 'Swagger UI at /api/docs');
} catch (_) { /* docs optional */ }

app.use('/api', (req, res, next) => {
    if (req.method && req.originalUrl) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not found' } });
    }
    next();
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;