const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticate(req, res, next) {
  const header = req.get('authorization');
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token requerido.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o vencido.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'administrador') return res.status(403).json({ error: 'Se requiere rol administrador.' });
  next();
}

module.exports = { authenticate, requireAdmin };
