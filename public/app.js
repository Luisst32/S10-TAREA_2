const state = {
  token: localStorage.getItem('catalogoToken') || '',
  user: JSON.parse(localStorage.getItem('catalogoUser') || 'null'),
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function headers(json = false) {
  const result = {};
  if (json) result['Content-Type'] = 'application/json';
  if (state.token) result.Authorization = `Bearer ${state.token}`;
  return result;
}

async function api(path, options = {}) {
  const response = await fetch(path, options);
  let body = null;
  if (response.status !== 204) body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.error || `Solicitud rechazada (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return { status: response.status, body };
}

function money(value) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(value));
}

function toast(message, isError = false) {
  const element = $('#toast');
  element.textContent = message;
  element.className = `toast show${isError ? ' error' : ''}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { element.className = 'toast'; }, 3000);
}

function updateSession() {
  const isAdmin = state.user?.role === 'administrador';
  $('#session').innerHTML = state.user
    ? `<span class="session-dot"></span><span>${state.user.name} · ${state.user.role}</span>`
    : '<span class="session-dot"></span><span>Sesión pública</span>';
  $('#roleBadge').textContent = state.user?.role || 'público';
  $('#roleBadge').className = `badge ${isAdmin ? 'admin' : state.user ? 'user' : ''}`;
  $('#authForms').classList.toggle('hidden', Boolean(state.user));
  $('#logoutButton').classList.toggle('hidden', !state.user);
  $('.admin-only').classList.toggle('hidden', !isAdmin);
  if (isAdmin) loadAdminProducts();
}

function card(product, favorite = false) {
  const isAdmin = state.user?.role === 'administrador';
  return `
    <article class="product-card">
      <span class="category">${escapeHtml(product.category)}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p>${escapeHtml(product.description)}</p>
      <div class="price">${money(product.price)}</div>
      <div class="product-actions">
        ${state.user && !isAdmin ? `
          <button class="button ${favorite ? 'danger' : 'secondary'}" data-favorite="${product.id}">
            ${favorite ? 'Quitar favorito' : 'Agregar favorito'}
          </button>` : ''}
        ${isAdmin ? `
          <button class="button secondary" data-edit="${product.id}">Editar</button>
          <button class="button danger" data-delete="${product.id}">Eliminar</button>` : ''}
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

async function loadProducts() {
  const category = $('#categoryFilter').value;
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  try {
    const result = await api(`/api/productos${query}`);
    $('#productsGrid').innerHTML = result.body.products.length
      ? result.body.products.map((product) => card(product)).join('')
      : '<div class="empty">No hay productos en esta categoría.</div>';
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadFavorites() {
  if (!state.token) {
    $('#favoritesGrid').innerHTML = '<div class="empty">Inicia sesión para consultar tus favoritos personales.</div>';
    return;
  }
  try {
    const result = await api('/api/favoritos', { headers: headers() });
    $('#favoritesGrid').innerHTML = result.body.favorites.length
      ? result.body.favorites.map((product) => card(product, true)).join('')
      : '<div class="empty">Aún no tienes productos favoritos.</div>';
  } catch (error) {
    toast(error.message, true);
  }
}

async function loadAdminProducts() {
  if (state.user?.role !== 'administrador') return;
  try {
    const result = await api('/api/productos');
    $('#adminProducts').innerHTML = result.body.products.map((product) => card(product)).join('');
  } catch (error) {
    toast(error.message, true);
  }
}

async function setFavorite(productId, remove) {
  if (!state.token) {
    toast('Inicia sesión para usar favoritos.', true);
    return;
  }
  try {
    if (remove) {
      await api(`/api/favoritos/${productId}`, { method: 'DELETE', headers: headers() });
      toast('Producto eliminado de favoritos.');
    } else {
      await api('/api/favoritos', {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ productId }),
      });
      toast('Producto agregado a favoritos.');
    }
    loadFavorites();
  } catch (error) {
    toast(error.message, true);
  }
}

async function submitAuth(event, register = false) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  try {
    if (register) {
      await api('/api/auth/registro', {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify(data),
      });
      toast('Usuario creado. Ahora inicia sesión.');
      form.reset();
      $('#showLogin').click();
      return;
    }
    const result = await api('/api/auth/login', {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify(data),
    });
    state.token = result.body.token;
    state.user = result.body.user;
    localStorage.setItem('catalogoToken', state.token);
    localStorage.setItem('catalogoUser', JSON.stringify(state.user));
    form.reset();
    updateSession();
    toast(`Sesión iniciada como ${state.user.role}.`);
  } catch (error) {
    toast(error.message, true);
  }
}

async function saveProduct(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const id = data.id;
  delete data.id;
  try {
    const result = await api(id ? `/api/productos/${id}` : '/api/productos', {
      method: id ? 'PUT' : 'POST',
      headers: headers(true),
      body: JSON.stringify(data),
    });
    toast(id ? 'Producto actualizado.' : 'Producto creado.');
    form.reset();
    $('#cancelEdit').classList.add('hidden');
    loadProducts();
    loadAdminProducts();
  } catch (error) {
    toast(error.message, true);
  }
}

async function editOrDelete(action, id) {
  if (action === 'delete') {
    if (!confirm('¿Eliminar este producto? Sus favoritos relacionados también se eliminarán.')) return;
    try {
      await api(`/api/productos/${id}`, { method: 'DELETE', headers: headers() });
      toast('Producto eliminado.');
      loadProducts();
      loadAdminProducts();
    } catch (error) {
      toast(error.message, true);
    }
    return;
  }
  try {
    const result = await api(`/api/productos/${id}`);
    const product = result.body.product;
    const form = $('#productForm');
    form.elements.id.value = product.id;
    form.elements.name.value = product.name;
    form.elements.description.value = product.description;
    form.elements.category.value = product.category;
    form.elements.price.value = product.price;
    $('#cancelEdit').classList.remove('hidden');
  } catch (error) {
    toast(error.message, true);
  }
}

function logTest(name, status, body) {
  const success = status >= 200 && status < 400;
  const entry = document.createElement('div');
  entry.className = `test-entry ${success ? 'success' : 'error'}`;
  entry.innerHTML = `<strong>${escapeHtml(name)} · HTTP ${status}</strong><pre>${escapeHtml(JSON.stringify(body, null, 2))}</pre>`;
  $('#testLog').prepend(entry);
}

async function runTest(type) {
  const tests = {
    health: ['GET /health', () => api('/health')],
    products: ['GET /api/productos', () => api('/api/productos')],
    noToken: ['GET /api/favoritos sin token', () => api('/api/favoritos')],
    invalidPrice: ['POST /api/productos con precio inválido', () => api('/api/productos', { method: 'POST', headers: headers(true), body: JSON.stringify({ name: 'Prueba', description: 'Prueba', category: 'test', price: -1 }) })],
    missingProduct: ['GET /api/productos/999999', () => api('/api/productos/999999')],
  };

  if (type === 'duplicateFavorite') {
    if (!state.token) return logTest('Favorito duplicado', 401, { error: 'Inicia sesión primero.' });
    try {
      await api('/api/favoritos', { method: 'POST', headers: headers(true), body: JSON.stringify({ productId: 1 }) });
      try {
        await api('/api/favoritos', { method: 'POST', headers: headers(true), body: JSON.stringify({ productId: 1 }) });
      } catch (error) {
        logTest('POST favorito duplicado', error.status, error.body);
      }
    } catch (error) {
      if (error.status === 409) logTest('POST favorito duplicado', error.status, error.body);
      else {
        try { await api('/api/favoritos', { method: 'POST', headers: headers(true), body: JSON.stringify({ productId: 1 }) }); }
        catch (secondError) { logTest('POST favorito duplicado', secondError.status, secondError.body); }
      }
    }
    return;
  }

  if (type === 'restart') {
    try {
      const result = await api('/api/productos');
      logTest('Persistencia: catálogo reconsultado', result.status, result.body);
    } catch (error) {
      logTest('Persistencia: catálogo reconsultado', error.status || 500, error.body || { error: error.message });
    }
    return;
  }

  const test = tests[type];
  try {
    const result = await test[1]();
    logTest(test[0], result.status, result.body);
  } catch (error) {
    logTest(test[0], error.status || 500, error.body || { error: error.message });
  }
}

$$('.tab').forEach((button) => button.addEventListener('click', () => {
  $$('.tab').forEach((tab) => tab.classList.remove('active'));
  $$('.panel').forEach((panel) => panel.classList.remove('active'));
  button.classList.add('active');
  $(`#${button.dataset.tab}`).classList.add('active');
  if (button.dataset.tab === 'catalogo') loadProducts();
  if (button.dataset.tab === 'favoritos') loadFavorites();
  if (button.dataset.tab === 'administracion') loadAdminProducts();
}));

$('#showLogin').addEventListener('click', () => {
  $('#showLogin').classList.add('active');
  $('#showRegister').classList.remove('active');
  $('#loginForm').classList.remove('hidden');
  $('#registerForm').classList.add('hidden');
});
$('#showRegister').addEventListener('click', () => {
  $('#showRegister').classList.add('active');
  $('#showLogin').classList.remove('active');
  $('#registerForm').classList.remove('hidden');
  $('#loginForm').classList.add('hidden');
});
$('#loginForm').addEventListener('submit', (event) => submitAuth(event));
$('#registerForm').addEventListener('submit', (event) => submitAuth(event, true));
$('#logoutButton').addEventListener('click', () => {
  state.token = '';
  state.user = null;
  localStorage.removeItem('catalogoToken');
  localStorage.removeItem('catalogoUser');
  updateSession();
  loadProducts();
  toast('Sesión cerrada.');
});
$('#categoryFilter').addEventListener('change', loadProducts);
$('#refreshFavorites').addEventListener('click', loadFavorites);
$('#productForm').addEventListener('submit', saveProduct);
$('#cancelEdit').addEventListener('click', () => {
  $('#productForm').reset();
  $('#cancelEdit').classList.add('hidden');
});
$('#clearLog').addEventListener('click', () => { $('#testLog').innerHTML = ''; });
$$('[data-test]').forEach((button) => button.addEventListener('click', () => runTest(button.dataset.test)));

document.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite]');
  if (favoriteButton) {
    const favorite = favoriteButton.textContent.includes('Quitar');
    setFavorite(favoriteButton.dataset.favorite, favorite);
  }
  const editButton = event.target.closest('[data-edit]');
  if (editButton) editOrDelete('edit', editButton.dataset.edit);
  const deleteButton = event.target.closest('[data-delete]');
  if (deleteButton) editOrDelete('delete', deleteButton.dataset.delete);
});

updateSession();
loadProducts();
