const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
require('dotenv').config();

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña de al menos 8 caracteres son obligatorios.' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, LOWER($2), $3, \'usuario\') RETURNING id, name, email, role',
      [name.trim(), email.trim(), passwordHash]
    );
    res.status(201).json({ user: publicUser(rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'El correo ya está registrado.' });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = LOWER($1)', [email || '']);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) return res.status(401).json({ error: 'Credenciales incorrectas.' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
    res.json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
}

module.exports = { register, login };
