const bcrypt = require('bcryptjs');
const pool = require('./pool');

const products = [
  ['Teclado mecánico', 'Teclado compacto con interruptores mecánicos.', 'periféricos', 59.99],
  ['Mouse inalámbrico', 'Mouse ergonómico con conexión Bluetooth.', 'periféricos', 29.90],
  ['Monitor 24 pulgadas', 'Monitor Full HD para trabajo y estudio.', 'pantallas', 149.50],
  ['Base para laptop', 'Base ajustable de aluminio.', 'accesorios', 34.75],
  ['Audífonos USB', 'Audífonos con micrófono integrado.', 'audio', 42.00]
];

async function seed() {
  const passwordHash = await bcrypt.hash('Admin1234!', 12);
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'administrador')
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'administrador'`,
    ['Administrador', 'admin@example.com', passwordHash]
  );
  for (const product of products) {
    await pool.query(
      `INSERT INTO products (name, description, category, price)
       SELECT $1, $2, $3, $4 WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1)`, product
    );
  }
  console.log('Administrador y cinco productos de ejemplo preparados.');
  console.log('Administrador local: admin@example.com / Admin1234!');
}

seed().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
