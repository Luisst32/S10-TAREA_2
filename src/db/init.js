const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('./pool');

async function init() {
  const sql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Esquema de PostgreSQL creado/verificado.');
}

init().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
