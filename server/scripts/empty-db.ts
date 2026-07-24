import { sequelize } from '../src/db/database';
import '../src/db/models'; // Initialize models

async function emptyDatabase() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful. Emptying database (dropping and recreating tables)...');
    
    // Drop all tables and recreate them
    await sequelize.sync({ force: true });
    
    console.log('Database successfully emptied and synced!');
    process.exit(0);
  } catch (error) {
    console.error('Error emptying the database:', error);
    process.exit(1);
  }
}

emptyDatabase();
