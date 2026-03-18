require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    SESSION_SECRET: process.env.SESSION_SECRET || 'exam_secret_key',
    SESSION_TTL_HOURS: parseInt(process.env.SESSION_TTL_HOURS || '24', 10)
};
