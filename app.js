const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectToDb } = require('./db/db'); // <-- Destructure it properly

// ✅ Connect to database BEFORE importing routes
connectToDb();
// Import routes
const userRoutes = require('./routes/user.routes');
const verificationRoutes = require('./routes/verification.routes');
const commentRoutes = require('./routes/comment.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const leadRoutes = require('./routes/lead.routes');
const albumRoutes = require('./routes/album.routes');
const app = express();

// Connect to database


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


// Routes
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use('/user', userRoutes);
app.use('/verification', verificationRoutes);
app.use('/comment', commentRoutes);
app.use('/inquiry', inquiryRoutes);
app.use('/lead', leadRoutes);
app.use('/album', albumRoutes);
console.log("User routes loaded");

// Debug: Log registered routes
console.log("Registered Routes:");
app._router.stack.forEach((r) => {
    if (r.route) {
        console.log(`Route: ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
    }
});

module.exports = app;