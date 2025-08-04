import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer la base de données SQLite
const db = new Database(path.join(__dirname, 'formations.db'));

// Configuration de la base de données
db.pragma('foreign_keys = ON');
db.pragma('encoding = "UTF-8"');
db.pragma('journal_mode = WAL');

// Fonction pour initialiser la base de données
export function initializeDatabase() {
  // Table formations
  db.exec(`
    CREATE TABLE IF NOT EXISTS formations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intitule TEXT NOT NULL,
      cible TEXT NOT NULL,
      objectifs_pedagogiques TEXT NOT NULL,
      contenu TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table entreprises
  db.exec(`
    CREATE TABLE IF NOT EXISTS entreprises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raison_sociale TEXT NOT NULL UNIQUE,
      telephone TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table inscriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS inscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entreprise_id INTEGER NOT NULL,
      formation_id INTEGER NOT NULL,
      nombre_participants INTEGER NOT NULL,
      date_souhaitee DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
      FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
    )
  `);

  console.log('Base de données initialisée avec succès');
}

// Fonction pour insérer des données de test
export function seedDatabase() {
  // Vérifier si des données existent déjà
  const formationsCount = db.prepare('SELECT COUNT(*) as count FROM formations').get();
  
  if (formationsCount.count === 0) {
    // Insérer des formations de test
    const insertFormation = db.prepare(`
      INSERT INTO formations (intitule, cible, objectifs_pedagogiques, contenu)
      VALUES (?, ?, ?, ?)
    `);

    const formations = [
      {
        intitule: 'Formation React Avancé',
        cible: 'Développeurs JavaScript avec expérience React de base',
        objectifs_pedagogiques: 'Maîtriser les concepts avancés de React : hooks personnalisés, optimisation des performances, patterns avancés',
        contenu: 'Hooks avancés, Context API, Performance optimization, Testing, State management avec Redux Toolkit'
      },
      {
        intitule: 'Gestion de Projet Agile',
        cible: 'Chefs de projet, Product Owners, Scrum Masters',
        objectifs_pedagogiques: 'Comprendre et appliquer les méthodologies agiles dans la gestion de projet',
        contenu: 'Scrum, Kanban, User Stories, Sprint Planning, Retrospectives, Outils de gestion agile'
      },
      {
        intitule: 'Cybersécurité pour les Entreprises',
        cible: 'Responsables IT, Administrateurs système',
        objectifs_pedagogiques: 'Identifier et prévenir les menaces de sécurité informatique',
        contenu: 'Analyse des risques, Sécurité des réseaux, Cryptographie, Gestion des incidents, Conformité RGPD'
      }
    ];

    formations.forEach(formation => {
      insertFormation.run(formation.intitule, formation.cible, formation.objectifs_pedagogiques, formation.contenu);
    });

    // Insérer des entreprises de test
    const insertEntreprise = db.prepare(`
      INSERT INTO entreprises (raison_sociale, telephone, email)
      VALUES (?, ?, ?)
    `);

    const entreprises = [
      { raison_sociale: 'TechCorp Solutions', telephone: '01 23 45 67 89', email: 'contact@techcorp.fr' },
      { raison_sociale: 'Digital Innovations', telephone: '01 98 76 54 32', email: 'info@digital-innovations.fr' },
      { raison_sociale: 'StartUp Dynamics', telephone: '01 11 22 33 44', email: 'hello@startup-dynamics.fr' },
      { raison_sociale: 'BMI WFS', telephone: '0101222111', email: 'info@bmi.ci' }
    ];

    entreprises.forEach(entreprise => {
      insertEntreprise.run(entreprise.raison_sociale, entreprise.telephone, entreprise.email);
    });

    console.log('Données de test insérées avec succès');
  }
}

export default db;
