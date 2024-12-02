const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const scenariosRoutes = require('./routes/scenarios');
const actionsRoutes = require('./routes/actions');
const openaiRoutes = require('./routes/openai');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/openai', openaiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
