require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
let MongoStore = null;
try {
  MongoStore = require('connect-mongo');
} catch (err) {
  MongoStore = null;
}
const connectDB = require('./config/database');
const { PORT, MONGO_URI, CLIENT_URL, SESSION_SECRET, SESSION_TTL_HOURS } = require('./config/keys');

// Initialize Express
const app = express();
app.set('trust proxy', 1);

// Connect to Database
connectDB();

// Passport Config
require('./config/passport')(passport);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS Middleware
app.use(cors({
    origin: CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Session Middleware (stored in MongoDB when available)
const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000
  }
};

if (MongoStore) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: SESSION_TTL_HOURS * 60 * 60
  });
}

app.use(session(sessionOptions));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/exam', require('./routes/examFlowRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root Route
app.get('/', (req, res) => {
    res.send('Online Exam System API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong on the server',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
