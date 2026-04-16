// ✅ DONE — Express app entry point
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tests', require('./routes/test.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/results', require('./routes/result.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n  LabEval API running on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health\n`);
});
