require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => logger.info('server', `Server running on port ${PORT}`));

