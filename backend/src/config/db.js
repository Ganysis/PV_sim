require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'awema_user',
  password: process.env.DB_PASSWORD || 'awema_password',
  database: process.env.DB_NAME || 'simulateur_pv',
  port: process.env.DB_PORT || 5432
});

module.exports = pool;
