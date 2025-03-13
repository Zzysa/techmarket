import { Pool } from "pg";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const executeQuery = async (query: string) => {
  try {
    const result = await pool.query(query); 
    return result; 
  } catch (err) {
    throw err;
  }
};

const initDb = async () => {
  
  const initScript = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();

  try {
    await executeQuery(initScript);
    console.log('Database has been initialized.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDb();

export default pool;
