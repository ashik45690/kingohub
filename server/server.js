require('dotenv').config();

const express = require('express');
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
const {
  PORT,
  MONGO_URI,
  SESSION_SECRET,
  SESSION_TTL_HOURS
} = require('./config/keys');

// Initialize Express
const app = express();

app.set('trust proxy', 1);

// Connect Database
connectDB();

// Passport Config
require('./config/passport')(passport);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ==================== CORS ====================

const allowedOrigins = [
  "http://localhost:5173",
  "https://kingohub.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

// ==================== SESSION ====================

const sessionOptions = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: Number(SESSION_TTL_HOURS) * 60 * 60 * 1000
  }
};

if (MongoStore) {
  sessionOptions.store = MongoStore.create({
    mongoUrl: MONGO_URI,
    ttl: Number(SESSION_TTL_HOURS) * 60 * 60
  });
}

app.use(session(sessionOptions));

// ==================== PASSPORT ====================

app.use(passport.initialize());
app.use(passport.session());

// ==================== ROUTES ====================

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

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Server Error"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});