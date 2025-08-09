import jwt from 'jsonwebtoken';
import { Entreprise } from '../models/Entreprise.js';
import { Employe } from '../models/Employe.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// Middleware to verify enterprise authentication
export const verifyEntreprise = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'entreprise') {
      return res.status(403).json({ error: 'Accès refusé. Type d\'utilisateur incorrect.' });
    }
    
    // Verify entreprise still exists
    const entreprise = Entreprise.getById(decoded.id);
    if (!entreprise) {
      return res.status(401).json({ error: 'Entreprise non trouvée.' });
    }
    
    req.entreprise = entreprise;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// Middleware to verify employee authentication
export const verifyEmploye = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'employe') {
      return res.status(403).json({ error: 'Accès refusé. Type d\'utilisateur incorrect.' });
    }
    
    // Verify employe still exists
    const employe = Employe.getById(decoded.id);
    if (!employe) {
      return res.status(401).json({ error: 'Employé non trouvé.' });
    }
    
    req.employe = employe;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// Generate JWT token for entreprise
export const generateEntrepriseToken = (entreprise) => {
  return jwt.sign(
    {
      id: entreprise.id,
      email: entreprise.email,
      type: 'entreprise'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate JWT token for employe
export const generateEmployeToken = (employe) => {
  return jwt.sign(
    {
      id: employe.id,
      email: employe.email,
      type: 'employe',
      entreprise_id: employe.entreprise_id
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Optional: Middleware for rate limiting login attempts
export const rateLimitLogin = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_attempts_${ip}`;
  
  if (!global.loginAttempts) {
    global.loginAttempts = new Map();
  }
  
  const attempts = global.loginAttempts.get(key) || { count: 0, lastAttempt: Date.now() };
  
  // Reset counter if more than 15 minutes have passed
  if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.' 
    });
  }
  
  // Increment counter on failed login (will be called from route handler)
  req.incrementLoginAttempts = () => {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    global.loginAttempts.set(key, attempts);
  };
  
  // Reset counter on successful login
  req.resetLoginAttempts = () => {
    global.loginAttempts.delete(key);
  };
  
  next();
};
