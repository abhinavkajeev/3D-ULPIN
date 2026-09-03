const express = require('express');
const cors = require('cors');
const { testConnection } = require('./db');

const parcelsRouter = require('./routes/parcels');
const buildingsRouter = require('./routes/buildings');
const ulpinRouter = require('./routes/ulpin');
const validationRouter = require('./routes/validation');
const infrastructureRouter = require('./routes/infrastructure');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/v1/health', async (req, res) => {
  const db = require('./db');
  try {
    const result = await db.query('SELECT PostGIS_Version() AS postgis, COUNT(*) AS parcels FROM parcels');
    res.json({
      status: 'operational',
      service: '3D Cadastral ULPIN Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL 16 + PostGIS',
      postgisVersion: result.rows[0].postgis,
      totalParcels: parseInt(result.rows[0].parcels),
      uptime: process.uptime(),
    });
  } catch (err) {
    res.json({ status: 'degraded', error: err.message });
  }
});

// API Routes
app.use('/api/v1/parcels', parcelsRouter);
app.use('/api/v1/buildings', buildingsRouter);
app.use('/api/v1/ulpin', ulpinRouter);
app.use('/api/v1/validation', validationRouter);
app.use('/api/v1/infrastructure', infrastructureRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
async function start() {
  console.log(`\n🏗️  3D Cadastral ULPIN Backend`);
  console.log(`   ├─ Status:    Starting...`);
  console.log(`   ├─ Port:      ${PORT}`);
  console.log(`   ├─ API Base:  http://localhost:${PORT}/api/v1`);

  const dbConnected = await testConnection();

  app.listen(PORT, () => {
    console.log(`   └─ Server:    ✅ Running at http://localhost:${PORT}\n`);
  });
}

start();
