import { db } from './server/database/database.js';

console.log('🔍 Testing database structure...');

try {
  // Check if tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('📋 Available tables:', tables.map(t => t.name));

  // Check evaluation_attempts table structure
  const evalAttemptsInfo = db.prepare("PRAGMA table_info(evaluation_attempts)").all();
  console.log('📊 evaluation_attempts table structure:', evalAttemptsInfo);

  // Check if there are any evaluation attempts
  const attemptCount = db.prepare("SELECT COUNT(*) as count FROM evaluation_attempts").get();
  console.log('📈 Total evaluation attempts:', attemptCount.count);

  // Check if there are any enterprises
  const enterpriseCount = db.prepare("SELECT COUNT(*) as count FROM entreprises").get();
  console.log('🏢 Total enterprises:', enterpriseCount.count);

  // Check if there are any employees
  const employeeCount = db.prepare("SELECT COUNT(*) as count FROM employes").get();
  console.log('👥 Total employees:', employeeCount.count);

  // Test the specific query that's failing
  console.log('\n🧪 Testing analytics query for enterprise 3...');
  const testQuery = `
    SELECT 
      ea.*,
      e.nom as employe_nom,
      e.prenom as employe_prenom,
      e.email as employe_email,
      ev.titre as evaluation_titre,
      s.description as seance_description,
      f.intitule as formation_nom
    FROM evaluation_attempts ea
    JOIN employes e ON ea.employe_id = e.id
    JOIN evaluations ev ON ea.evaluation_id = ev.id
    JOIN seances s ON ev.seance_id = s.id
    JOIN formations f ON s.formation_id = f.id
    WHERE e.entreprise_id = ?
    ORDER BY ea.created_at DESC
  `;
  
  const stmt = db.prepare(testQuery);
  const results = stmt.all(3);
  console.log('📊 Query results for enterprise 3:', results.length, 'records');
  
  if (results.length > 0) {
    console.log('📄 Sample result:', results[0]);
  }

} catch (error) {
  console.error('❌ Database test failed:', error.message);
  console.error('Stack:', error.stack);
}
