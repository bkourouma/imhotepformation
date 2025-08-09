import db from '../database.js';

export function migrateToParticipants() {
  console.log('Starting migration to participants table...');

  // Create participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inscription_id INTEGER NOT NULL,
      nom TEXT NOT NULL,
      prenom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT NOT NULL,
      fonction TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (inscription_id) REFERENCES inscriptions(id) ON DELETE CASCADE
    )
  `);

  // Check current table structure
  const tableInfo = db.prepare("PRAGMA table_info(inscriptions)").all();
  const hasNombreParticipants = tableInfo.some(col => col.name === 'nombre_participants');
  const hasDateSouhaitee = tableInfo.some(col => col.name === 'date_souhaitee');

  console.log('Current table structure:', tableInfo.map(col => col.name));

  // Only migrate if we have the old columns
  if (hasNombreParticipants || hasDateSouhaitee) {
    console.log('Migrating existing inscriptions to participants...');
    
    // Only try to get nombre_participants if the column exists
    if (hasNombreParticipants) {
      try {
        const inscriptions = db.prepare('SELECT id, nombre_participants FROM inscriptions WHERE nombre_participants > 0').all();
        
        // Create default participants for each inscription
        const insertParticipant = db.prepare(`
          INSERT INTO participants (inscription_id, nom, prenom, email, telephone, fonction)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        inscriptions.forEach(inscription => {
          for (let i = 0; i < inscription.nombre_participants; i++) {
            insertParticipant.run(
              inscription.id,
              `Participant ${i + 1}`,
              '',
              'participant@exemple.com',
              '01 00 00 00 00',
              'À définir'
            );
          }
        });

        console.log(`Created ${inscriptions.reduce((sum, ins) => sum + ins.nombre_participants, 0)} default participants`);
      } catch (error) {
        console.log('No nombre_participants column found, skipping participant creation');
      }
    }

    // Remove the nombre_participants and date_souhaitee columns from inscriptions table
    console.log('Removing nombre_participants and date_souhaitee columns from inscriptions table...');
    
    // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
    db.exec(`
      CREATE TABLE inscriptions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entreprise_id INTEGER NOT NULL,
        formation_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (entreprise_id) REFERENCES entreprises(id) ON DELETE CASCADE,
        FOREIGN KEY (formation_id) REFERENCES formations(id) ON DELETE CASCADE
      )
    `);

    // Copy data from old table to new table (only the columns we want to keep)
    db.exec(`
      INSERT INTO inscriptions_new (id, entreprise_id, formation_id, created_at)
      SELECT id, entreprise_id, formation_id, created_at
      FROM inscriptions
    `);

    // Drop old table and rename new table
    db.exec('DROP TABLE inscriptions');
    db.exec('ALTER TABLE inscriptions_new RENAME TO inscriptions');

    console.log('Successfully removed nombre_participants and date_souhaitee columns');
  } else {
    console.log('Table already has the correct structure, no migration needed');
  }

  console.log('Migration completed successfully');
} 