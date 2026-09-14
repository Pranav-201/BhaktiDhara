require('dotenv').config();
const express = require('express');
const cors = require('cors');

const youtubeRoutes = require('./routes/youtube');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: only allow the configured client origin(s). Falls back to allow-all
// in local dev if not set, but you should set CLIENT_ORIGIN in production.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET']
  })
);

app.use(express.json());

// This backend is ONLY used for online features (YouTube search).
// It never receives or stores the user's personal music library —
// that lives entirely in the browser's IndexedDB.
app.use('/api/youtube', youtubeRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic input validation happens in the controller; this catches anything else.
app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Bhakti Sangeet backend running on port ${PORT}`);
});
