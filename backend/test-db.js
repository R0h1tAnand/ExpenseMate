require('dotenv').config();
const { sequelize } = require('./config/db');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    console.log('Testing database access...');
    const [results] = await sequelize.query('SELECT version()');
    console.log('✅ PostgreSQL version:', results[0].version);
    
    console.log('Checking if database exists...');
    const [dbResults] = await sequelize.query(`SELECT datname FROM pg_database WHERE datname = '${process.env.DB_NAME}'`);
    if (dbResults.length > 0) {
      console.log('✅ Database exists');
    } else {
      console.log('❌ Database does not exist');
    }
    
    console.log('Checking tables...');
    const [tableResults] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tableResults.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();