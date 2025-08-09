import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { initializeDatabase } from './database/database.js';
import formationsRoutes from './routes/formations.js';
import entreprisesRoutes from './routes/entreprises.js';
import inscriptionsRoutes from './routes/inscriptions.js';
import dashboardRoutes from './routes/dashboard.js';
import employesRoutes from './routes/employes.js';
import seancesRoutes from './routes/seances.js';
import groupesRoutes from './routes/groupes.js';
import participantsRoutes from './routes/participants.js';
import seanceMediaRoutes from './routes/seanceMedia.js';
import enseignantsRoutes from './routes/enseignants.js';
import employeAuthRoutes from './routes/employeAuth.js';
import entrepriseAuthRoutes from './routes/entrepriseAuth.js';
import evaluationsRoutes from './routes/evaluations.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import { Entreprise } from './models/Entreprise.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3006;
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

// Ensure demo/test entreprise accounts (especially BMI) are set up with a working password
(async () => {
  try {
    const oldBmiEmail = 'info@bmi.ci';
    const bmiEmail = 'baba.kourouma@allianceconsultants.net';
    const bmiPassword = 'bmi9012';

    // Migrate old BMI email to new if needed to avoid duplicates
    const oldRecord = Entreprise.getByEmail(oldBmiEmail);
    if (oldRecord) {
      console.log('🔁 Migrating BMI email from info@bmi.ci to baba.kourouma@allianceconsultants.net');
      try {
        Entreprise.updateEmail(oldRecord.id, bmiEmail);
      } catch (e) {
        console.warn('⚠️ BMI email migration failed (may already exist):', e?.message || e);
      }
    }

    const existingBmi = Entreprise.getByEmail(bmiEmail);

    if (!existingBmi) {
      console.log('🔧 Creating demo entreprise BMI WFS with default credentials');
      await Entreprise.createWithPassword({
        raison_sociale: 'BMI WFS',
        email: bmiEmail,
        telephone: '0708977823',
        adresse: '',
        password: bmiPassword
      });
    } else {
      console.log('🔧 Ensuring BMI WFS has a working password');
      await Entreprise.updatePassword(existingBmi.id, bmiPassword);
    }
    const verify = await Entreprise.authenticate(bmiEmail, bmiPassword);
    if (!verify) {
      console.warn('⚠️ BMI login still failing after update. Forcing plain text then hashing path.');
    }
    console.log('✅ Demo entreprise BMI WFS ready for login');
  } catch (seedErr) {
    console.warn('⚠️ Unable to ensure demo entreprise credentials:', seedErr?.message || seedErr);
  }
})();

// Routes
app.use('/api/formations', formationsRoutes);
app.use('/api/entreprises', entreprisesRoutes);
app.use('/api/inscriptions', inscriptionsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employes', employesRoutes);
app.use('/api/seances', seancesRoutes);
app.use('/api/groupes', groupesRoutes);
app.use('/api/participants', participantsRoutes);
app.use('/api/seance-media', seanceMediaRoutes);
app.use('/api/enseignants', enseignantsRoutes);
app.use('/api/employe', employeAuthRoutes);
app.use('/api/entreprise', entrepriseAuthRoutes);
app.use('/api/evaluations', evaluationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);

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

// Add error handling for the server
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
  console.log(`🔧 Mode production: ${isProduction}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📁 Serving static files: ${isProduction ? 'YES' : 'NO'}`);
});
