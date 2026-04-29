require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// In development allow the Vite dev server; in production serve from same origin
if (!IS_PROD) {
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }));
}

app.use(express.json());
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/farms', require('./routes/farms'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stripe', require('./routes/stripe'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React build in production
if (IS_PROD) {
  const clientBuild = path.join(__dirname, '../client/dist');
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    // All non-API routes → React (client-side routing)
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuild, 'index.html'));
    });
  }
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🌱 AgroLink server running on http://localhost:${PORT} [${IS_PROD ? 'production' : 'development'}]`);
});
