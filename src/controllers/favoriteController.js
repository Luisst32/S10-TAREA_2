const pool = require('../db/pool');

function isPositiveInteger(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.description, p.category, p.price, p.created_at, p.updated_at
       FROM favorites f
       JOIN products p ON p.id = f.product_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC, p.id`,
      [req.user.id]
    );
    res.json({ favorites: rows });
  } catch (error) {
    next(error);
  }
}

async function add(req, res, next) {
  try {
    const productId = req.body.productId;
    if (!isPositiveInteger(productId)) {
      return res.status(400).json({ error: 'productId debe ser un identificador entero positivo.' });
    }

    const product = await pool.query('SELECT id FROM products WHERE id = $1', [Number(productId)]);
    if (!product.rows[0]) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)',
      [req.user.id, Number(productId)]
    );
    res.status(201).json({ message: 'Producto agregado a favoritos.', productId: Number(productId) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El producto ya está en tus favoritos.' });
    }
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const productId = req.params.productoId;
    if (!isPositiveInteger(productId)) {
      return res.status(400).json({ error: 'productoId debe ser un identificador entero positivo.' });
    }

    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [req.user.id, Number(productId)]
    );
    if (!result.rowCount) {
      return res.status(404).json({ error: 'El producto no está en tus favoritos.' });
    }
    res.status(200).json({ message: 'Producto eliminado de favoritos.', productId: Number(productId) });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, add, remove };
