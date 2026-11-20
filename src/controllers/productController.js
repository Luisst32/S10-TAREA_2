const pool = require('../db/pool');

const fields = ['name', 'description', 'category', 'price'];
function validate(body) {
  if (!body.name?.trim() || !body.description?.trim() || !body.category?.trim() || Number.isNaN(Number(body.price)) || Number(body.price) <= 0) return 'Nombre, descripción, categoría y precio mayor que cero son obligatorios.';
  return null;
}

async function list(req, res, next) {
  try {
    const params = [];
    let query = 'SELECT id, name, description, category, price, created_at, updated_at FROM products';
    if (req.query.category) { params.push(req.query.category); query += ' WHERE category = $1'; }
    query += ' ORDER BY id';
    const { rows } = await pool.query(query, params);
    res.json({ products: rows });
  } catch (error) { next(error); }
}

async function getOne(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT id, name, description, category, price, created_at, updated_at FROM products WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ product: rows[0] });
  } catch (error) { next(error); }
}

async function create(req, res, next) {
  try {
    const errorMessage = validate(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });
    const { name, description, category, price } = req.body;
    const { rows } = await pool.query('INSERT INTO products (name, description, category, price) VALUES ($1, $2, $3, $4) RETURNING *', [name.trim(), description.trim(), category.trim(), price]);
    res.status(201).json({ product: rows[0] });
  } catch (error) { next(error); }
}

async function update(req, res, next) {
  try {
    const errorMessage = validate(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });
    const { name, description, category, price } = req.body;
    const { rows } = await pool.query('UPDATE products SET name=$1, description=$2, category=$3, price=$4, updated_at=NOW() WHERE id=$5 RETURNING *', [name.trim(), description.trim(), category.trim(), price, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json({ product: rows[0] });
  } catch (error) { next(error); }
}

async function remove(req, res, next) {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.status(204).send();
  } catch (error) { next(error); }
}

module.exports = { list, getOne, create, update, remove, fields };
