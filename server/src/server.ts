import app from './app';
import { sequelize } from './db/database';
import './db/models'; // Initialize models and associations
import { azureBlobProvider } from './providers/azure-blob.provider';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Authenticate with DB
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Sync models (In production, use migrations instead of sync)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    // Initialize Azure Blob Container
    await azureBlobProvider.initialize();

    app.listen(PORT, () => {
      console.log(`🚀 ListingShield API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

startServer();
