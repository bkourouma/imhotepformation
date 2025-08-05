import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, seedDatabase } from './database/database.js';
import formationsRoutes from './routes/formations.js';
import entreprisesRoutes from './routes/entreprises.js';
import inscriptionsRoutes from './routes/inscriptions.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
// Force production mode on Azure (when PORT is set by Azure) or when running on VPS
const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT || process.env.FORCE_PRODUCTION === 'true';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuration de l'encodage pour les API seulement
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Serve static files from React build in production
if (isProduction) {
  const staticPath = path.join(__dirname, '../dist');
  console.log(`📁 Serving static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  
  // Check if dist directory exists
  const fs = await import('fs');
  if (!fs.existsSync(staticPath)) {
    console.error(`❌ Static files directory not found: ${staticPath}`);
  } else {
    console.log(`✅ Static files directory exists: ${staticPath}`);
    const files = fs.readdirSync(staticPath);
    console.log(`📄 Files in dist: ${files.join(', ')}`);
  }
}

// Initialiser la base de données
initializeDatabase();
seedDatabase();

// Routes
app.use('/api/formations', formationsRoutes);
app.use('/api/entreprises', entreprisesRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Formations en fonctionnement',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Route API non trouvée' });
});

// Handle React routing in production - serve index.html for all non-API routes
if (isProduction) {
  app.get('*', (req, res) => {
    console.log(`🌐 Serving React app for route: ${req.path}`);
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log(`📄 Looking for index.html at: ${indexPath}`);
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err);
        res.status(500).json({ 
          error: 'Error loading application',
          details: process.env.NODE_ENV === 'development' ? err.message : 'Static files not found'
        });
      } else {
        console.log(`✅ Successfully served index.html for route: ${req.path}`);
      }
    });
  });
} else {
  // Route 404 for development
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🔧 Mode production: ${isProduction}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📁 Serving static files: ${isProduction ? 'YES' : 'NO'}`);
});
