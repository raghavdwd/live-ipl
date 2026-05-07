const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config/env.config');
const proxyRoutes = require('./routes/proxy.routes');
const { errorHandler } = require('./middleware/error.middleware');
const { rateLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// Apply global middlewares
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

// API Routes
app.use('/api', proxyRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
