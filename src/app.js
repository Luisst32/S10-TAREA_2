require('dotenv').config();
const express = require('express');
const path = require('node:path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const favoriteRoutes = require('./routes/favorites');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET no está configurado.');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/favoritos', favoriteRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API ejecutándose en http://localhost:${port}`));

module.exports = app;
