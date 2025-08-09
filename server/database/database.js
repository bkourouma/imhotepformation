import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer la base de données
const dbPath = path.join(__dirname, 'formations.db');
export const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  console.log('Initialisation de la base de données...');

  // Table Entreprises
  // First, check if password column exists, if not add it
  try {
    // Try to add password column if it doesn't exist
    db.exec(`ALTER TABLE entreprises ADD COLUMN password TEXT`);
  } catch (error) {
    // Column might already exist, ignore error
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS entreprises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raison_sociale TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT NOT NULL,
      adresse TEXT,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table Formations
  db.exec(`
    CREATE TABLE IF NOT EXISTS formations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      intitule TEXT NOT NULL,
      cible TEXT,
      objectifs_pedagogiques TEXT,
      contenu TEXT,
      duree INTEGER, -- en heures
      prix DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table Employes (nouvelle table)
  // First, check if password column exists, if not add it
  try {
    // Try to add password column if it doesn't exist
    db.exec(`ALTER TABLE employes ADD COLUMN password TEXT`);
  } catch (error) {
    // Column might already exist, ignore error
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS employes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entreprise_id INTEGER NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL,
      fonction TEXT NOT NULL,
      telephone TEXT NOT NULL,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE
    )
  `);

  // Table Enseignants
  db.exec(`
    CREATE TABLE IF NOT EXISTS enseignants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      telephone TEXT,
      specialites TEXT, -- JSON array of specialties
      bio TEXT,
      actif BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table Seances (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS seances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      formation_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      duree INTEGER NOT NULL, -- en heures
      lieu TEXT NOT NULL,
      date_debut DATETIME NOT NULL,
      date_fin DATETIME NOT NULL,
      capacite_max INTEGER,
      statut TEXT DEFAULT 'planifie', -- planifie, en_cours, termine, annule
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
    )
  `);

  // Table Seance Media (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS seance_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seance_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL, -- pdf, powerpoint, image, video
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      title TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE
    )
  `);

  // Table Groupe (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS groupes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seance_id INTEGER NOT NULL,
      libelle TEXT NOT NULL,
      capacite_max INTEGER,
      date_debut DATETIME,
      date_fin DATETIME,
      enseignant_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
      FOREIGN KEY (enseignant_id) REFERENCES enseignants(id) ON DELETE SET NULL
    )
  `);

  // Table Inscriptions (pour compatibilité avec le modèle existant)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entreprise_id INTEGER NOT NULL,
      formation_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
      FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
    )
  `);

  // Table Participants (modifiée)
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employe_id INTEGER NOT NULL,
      groupe_id INTEGER NOT NULL,
      inscription_id INTEGER, -- Optionnel pour compatibilité
      present BOOLEAN DEFAULT 0, -- 0 = absent, 1 = present
      date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
      FOREIGN KEY (groupe_id) REFERENCES groupes(id) ON DELETE CASCADE,
      FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE SET NULL,
      UNIQUE(employe_id, groupe_id)
    )
  `);

  // Table MaterielCours (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS materiel_cours (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seance_id INTEGER NOT NULL,
      libelle TEXT NOT NULL,
      description TEXT,
      type TEXT, -- document, video, lien, etc.
      url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE
    )
  `);

  // Table Media Access History (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS media_access_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employe_id INTEGER NOT NULL,
      seance_media_id INTEGER NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE,
      FOREIGN KEY (seance_media_id) REFERENCES seance_media(id) ON DELETE CASCADE
    )
  `);

  // Table Evaluations (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seance_id INTEGER NOT NULL,
      employe_id INTEGER NOT NULL,
      titre TEXT NOT NULL,
      description TEXT,
      nombre_questions INTEGER DEFAULT 20,
      duree_minutes INTEGER DEFAULT 30,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seance_id) REFERENCES seances(id) ON DELETE CASCADE,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
    )
  `);

  // Table Questions d'évaluation (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluation_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      type TEXT NOT NULL, -- 'multiple_choice', 'multiple_choice_multiple', 'text'
      options TEXT, -- JSON array for multiple choice options
      correct_answers TEXT, -- JSON array for correct answers
      points INTEGER DEFAULT 1,
      ordre INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
    )
  `);

  // Table Tentatives d'évaluation (nouvelle table)
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluation_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      evaluation_id INTEGER NOT NULL,
      employe_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      pourcentage REAL NOT NULL,
      reponses TEXT, -- JSON object with question_id -> answer mapping
      temps_utilise INTEGER, -- en secondes
      termine BOOLEAN DEFAULT 0,
      date_debut DATETIME DEFAULT CURRENT_TIMESTAMP,
      date_fin DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
      FOREIGN KEY (employe_id) REFERENCES employes(id) ON DELETE CASCADE
    )
  `);

  // Insérer des données de test si les tables sont vides
  insertTestData();

  console.log('Base de données initialisée avec succès');
}

function insertTestData() {
  // Vérifier si des données existent déjà
  const entreprisesCount = db.prepare('SELECT COUNT(*) as count FROM entreprises').get().count;
  if (entreprisesCount === 0) {
    console.log('Insertion des données de test...');

    // Insérer des entreprises de test
    db.prepare(`
      INSERT INTO entreprises (raison_sociale, email, telephone, adresse, password)
      VALUES 
        ('Digital Innovations', 'info@digital-innovations.fr', '01 23 45 67 89', 'Paris, France', 'di1234'),
        ('Tech Solutions', 'contact@tech-solutions.com', '02 34 56 78 90', 'Lyon, France', 'ts5678'),
        ('BMI WFS', 'baba.kourouma@allianceconsultants.net', '03 45 67 89 01', 'Abidjan, Cote dIvoire', 'bmi9012')
    `).run();

    // Update existing enterprises without passwords
    const entreprisesWithoutPassword = db.prepare('SELECT * FROM entreprises WHERE password IS NULL OR password = ""').all();
    for (const entreprise of entreprisesWithoutPassword) {
      let defaultPassword = '';
      if (entreprise.email === 'info@digital-innovations.fr') {
        defaultPassword = 'di1234';
      } else if (entreprise.email === 'contact@tech-solutions.com') {
        defaultPassword = 'ts5678';
      } else if (entreprise.email === 'baba.kourouma@allianceconsultants.net') {
        defaultPassword = 'bmi9012';
      }

      if (defaultPassword) {
        db.prepare('UPDATE entreprises SET password = ? WHERE id = ?').run(defaultPassword, entreprise.id);
        console.log(`Updated password for enterprise: ${entreprise.email}`);
      }
    }

    // Insérer des formations de test
    db.prepare(`
      INSERT INTO formations (intitule, cible, objectifs_pedagogiques, contenu, duree, prix)
      VALUES 
        ('Formation React Avancé', 'Développeurs JavaScript avec expérience React de base', 'Maîtriser les concepts avancés de React', 'Hooks avancés, Context API, Performance', 16, 1200.00),
        ('Gestion de Projet Agile', 'Chefs de projet, Product Owners, Scrum Masters', 'Appliquer les méthodologies Agile', 'Scrum, Kanban, User Stories', 12, 900.00),
        ('Cybersécurité pour les Entreprises', 'Responsables IT, Administrateurs système', 'Sécuriser les infrastructures IT', 'Menaces, bonnes pratiques, outils', 20, 1500.00),
        ('Découverte et utilisation efficace de ChatGPT (1 jour)', 'Employés, responsables communication, chargés de contenus digitaux et toute personne souhaitant améliorer ses compétences en génération de contenus grâce à l''IA.', 'Maîtriser l''utilisation de ChatGPT', 'Prompts efficaces, cas d''usage, bonnes pratiques', 8, 600.00),
        ('Service client optimisé grâce à l''IA (2 jours)', 'Responsables service client, équipes support, responsables opérationnels', 'Optimiser le service client avec l''IA', 'Chatbots, analyse sentiment, automatisation', 16, 1200.00)
    `).run();

    // Insérer des employés de test (only if table is empty)
    const existingEmployes = db.prepare('SELECT COUNT(*) as count FROM employes').get();
    if (existingEmployes.count === 0) {
      db.prepare(`
        INSERT INTO employes (entreprise_id, nom, prenom, email, fonction, telephone, password)
        VALUES
          (1, 'Dupont', 'Jean', 'jean.dupont@digital-innovations.fr', 'Développeur Senior', '01 23 45 67 89', 'jd1234'),
          (1, 'Martin', 'Sophie', 'sophie.martin@digital-innovations.fr', 'Chef de Projet', '01 23 45 67 90', 'sm5678'),
          (2, 'Bernard', 'Pierre', 'pierre.bernard@tech-solutions.com', 'Développeur Full-Stack', '02 34 56 78 90', 'pb9012'),
          (3, 'Koné', 'Fatou', 'fatou.kone@bmi.ci', 'Responsable IT', '03 45 67 89 01', 'kf3456'),
          (3, 'Traoré', 'Moussa', 'moussa.traore@bmi.ci', 'Développeur', '03 45 67 89 02', 'tm7890')
      `).run();
    } else {
      // Update existing employees with passwords if they don't have them
      const employesWithoutPassword = db.prepare('SELECT * FROM employes WHERE password IS NULL OR password = ""').all();
      for (const employe of employesWithoutPassword) {
        const initials = (employe.prenom.charAt(0) + employe.nom.charAt(0)).toLowerCase();
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const password = initials + randomNumber;
        db.prepare('UPDATE employes SET password = ? WHERE id = ?').run(password, employe.id);
      }
    }

    // Insérer des enseignants de test
    db.prepare(`
      INSERT INTO enseignants (nom, prenom, email, telephone, specialites, bio, actif)
      VALUES
        ('Dubois', 'Marie', 'marie.dubois@formations.fr', '01 23 45 67 88', '["React", "JavaScript", "Frontend"]', 'Experte en développement frontend avec 8 ans d''expérience', 1),
        ('Leroy', 'Antoine', 'antoine.leroy@formations.fr', '01 23 45 67 87', '["Gestion de projet", "Agile", "Scrum"]', 'Consultant Agile certifié avec plus de 10 ans d''expérience', 1),
        ('Garcia', 'Elena', 'elena.garcia@formations.fr', '01 23 45 67 86', '["Cybersécurité", "Réseaux", "Sécurité"]', 'Spécialiste en cybersécurité, ancienne consultante en sécurité IT', 1),
        ('Moreau', 'Thomas', 'thomas.moreau@formations.fr', '01 23 45 67 85', '["IA", "ChatGPT", "Automatisation"]', 'Expert en intelligence artificielle et outils d''automatisation', 1),
        ('Rousseau', 'Claire', 'claire.rousseau@formations.fr', '01 23 45 67 84', '["Service client", "IA", "Communication"]', 'Formatrice spécialisée en service client et outils IA', 1)
    `).run();

    // Insérer des sessions de test
    db.prepare(`
      INSERT INTO seances (formation_id, description, duree, lieu, date_debut, date_fin, capacite_max, statut)
      VALUES 
        (1, 'Session 1: Hooks avancés et Context API', 8, 'Salle de formation A', '2025-09-15 09:00:00', '2025-09-15 17:00:00', 15, 'planifie'),
        (1, 'Session 2: Performance et optimisation', 8, 'Salle de formation A', '2025-09-16 09:00:00', '2025-09-16 17:00:00', 15, 'planifie'),
        (2, 'Session 1: Introduction à Scrum', 6, 'Salle de formation B', '2025-09-20 09:00:00', '2025-09-20 15:00:00', 12, 'planifie'),
        (2, 'Session 2: Kanban et User Stories', 6, 'Salle de formation B', '2025-09-21 09:00:00', '2025-09-21 15:00:00', 12, 'planifie'),
        (3, 'Session 1: Menaces et bonnes pratiques', 10, 'Salle de formation C', '2025-09-25 09:00:00', '2025-09-25 19:00:00', 10, 'planifie'),
        (3, 'Session 2: Outils et implémentation', 10, 'Salle de formation C', '2025-09-26 09:00:00', '2025-09-26 19:00:00', 10, 'planifie')
    `).run();

    // Insérer des groupes de test
    db.prepare(`
      INSERT INTO groupes (seance_id, libelle, capacite_max, date_debut, date_fin, enseignant_id)
      VALUES
        (1, 'Groupe A - Matin', 8, '2025-09-15 09:00:00', '2025-09-15 13:00:00', 1),
        (1, 'Groupe B - Après-midi', 7, '2025-09-15 14:00:00', '2025-09-15 17:00:00', 1),
        (2, 'Groupe A - Matin', 8, '2025-09-16 09:00:00', '2025-09-16 13:00:00', 1),
        (2, 'Groupe B - Après-midi', 7, '2025-09-16 14:00:00', '2025-09-16 17:00:00', 1),
        (3, 'Groupe Principal', 12, '2025-09-20 09:00:00', '2025-09-20 15:00:00', 2),
        (4, 'Groupe Principal', 12, '2025-09-21 09:00:00', '2025-09-21 15:00:00', 2),
        (5, 'Groupe Principal', 10, '2025-09-25 09:00:00', '2025-09-25 19:00:00', 3),
        (6, 'Groupe Principal', 10, '2025-09-26 09:00:00', '2025-09-26 19:00:00', 3)
    `).run();

    // Insérer des participants de test
    db.prepare(`
      INSERT INTO participants (employe_id, groupe_id, present)
      VALUES 
        (1, 1, 0),
        (2, 3, 0),
        (3, 5, 0),
        (4, 7, 0),
        (5, 1, 0)
    `).run();

    // Insérer du matériel de cours de test
    db.prepare(`
      INSERT INTO materiel_cours (seance_id, libelle, description, type, url)
      VALUES 
        (1, 'Slides React Hooks', 'Présentation sur les hooks avancés', 'document', 'https://example.com/slides-react-hooks.pdf'),
        (1, 'Exercices pratiques', 'TP sur les hooks et Context API', 'document', 'https://example.com/exercices-hooks.pdf'),
        (2, 'Slides Performance', 'Présentation sur l''optimisation React', 'document', 'https://example.com/slides-performance.pdf'),
        (3, 'Guide Scrum', 'Guide complet de la méthodologie Scrum', 'document', 'https://example.com/guide-scrum.pdf'),
        (5, 'Guide Cybersécurité', 'Bonnes pratiques de sécurité', 'document', 'https://example.com/guide-cybersecurite.pdf')
    `).run();

    // Insérer des évaluations de test
    db.prepare(`
      INSERT INTO evaluations (seance_id, employe_id, titre, description, nombre_questions, duree_minutes)
      VALUES 
        (5, 4, 'Évaluation Cybersécurité - Session 1', 'Test de connaissances sur les menaces et bonnes pratiques', 20, 30),
        (6, 4, 'Évaluation Cybersécurité - Session 2', 'Test de connaissances sur les outils et implémentation', 20, 30)
    `).run();

    // Insérer des questions d'évaluation de test
    db.prepare(`
      INSERT INTO evaluation_questions (evaluation_id, question, type, options, correct_answers, points, ordre)
      VALUES 
        (1, 'Qu''est-ce qui est le plus important dans la cybersécurité ?', 'multiple_choice', '["Avoir un bon antivirus", "Former les employés aux bonnes pratiques", "Avoir un pare-feu", "Sauvegarder régulièrement les données"]', '["Former les employés aux bonnes pratiques"]', 1, 1),
        (1, 'Quelles sont les bonnes pratiques de sécurité informatique ?', 'multiple_choice_multiple', '["Utiliser des mots de passe forts", "Partager ses identifiants avec ses collègues", "Mettre à jour régulièrement les logiciels", "Cliquer sur tous les liens reçus par email", "Faire des sauvegardes régulières"]', '["Utiliser des mots de passe forts", "Mettre à jour régulièrement les logiciels", "Faire des sauvegardes régulières"]', 1, 2),
        (1, 'Expliquez en quelques lignes pourquoi la formation à la cybersécurité est importante pour les entreprises.', 'text', '[]', '[]', 1, 3),
        (2, 'Quel est le meilleur moyen de protéger les données sensibles ?', 'multiple_choice', '["Les stocker en clair", "Les chiffrer", "Les partager publiquement", "Ne pas les sauvegarder"]', '["Les chiffrer"]', 1, 1),
        (2, 'Quels sont les types d''attaques les plus courants ?', 'multiple_choice_multiple', '["Phishing", "Malware", "DDoS", "Social engineering", "Firewall"]', '["Phishing", "Malware", "DDoS", "Social engineering"]', 1, 2)
    `).run();

    // Insérer des media de séance de test
    db.prepare(`
      INSERT INTO seance_media (seance_id, filename, original_name, file_type, mime_type, file_size, file_path, title, description)
      VALUES 
        (5, 'cybersecurite-guide.pdf', 'Guide Cybersécurité.pdf', 'pdf', 'application/pdf', 1024000, '/uploads/seance-media/cybersecurite-guide.pdf', 'Guide Cybersécurité', 'Guide complet sur les bonnes pratiques de cybersécurité'),
        (5, 'menaces-presentation.pptx', 'Présentation Menaces.pptx', 'powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2048000, '/uploads/seance-media/menaces-presentation.pptx', 'Présentation Menaces', 'Présentation sur les menaces cybersécurité'),
        (6, 'outils-securite.pdf', 'Outils de Sécurité.pdf', 'pdf', 'application/pdf', 1536000, '/uploads/seance-media/outils-securite.pdf', 'Outils de Sécurité', 'Guide des outils de sécurité informatique')
    `).run();

    console.log('Données de test insérées avec succès');
  }
}

export default db;
