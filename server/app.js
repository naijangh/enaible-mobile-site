const express = require('express');
const searchRoutes = require('./routes/search');

const app = express();
const PORT = 3000
// Middleware
app.use(express.json());

// Routes
app.use('/', searchRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
