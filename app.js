// ===== Nebula Shop - Professional Galaxy Store =====

// === Interactive Background ===
function initInteractiveBg() {
  const canvas = document.getElementById('interactiveStars');
  const layers = {
    stars1: document.getElementById('starsLayer1'),
    stars2: document.getElementById('starsLayer2'),
    stars3: document.getElementById('starsLayer3'),
    nebula: document.getElementById('nebulaLayer')
  };

  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
  const PARALLAX_STRENGTH = 0.025;
  const PARTICLE_COUNT = 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: 0, vy: 0,
        baseAlpha: Math.random() * 0.5 + 0.3,
        color: ['#fff', '#b0bec5', '#00b8d4', '#5e35b1', '#c2185b'][Math.floor(Math.random() * 5)]
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const mx = mouseX, my = mouseY;

    particles.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 150;

      if (dist < maxDist) {
        const force = (maxDist - dist) / maxDist;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 0.8;
        p.vy += Math.sin(angle) * force * 0.8;
        p.alpha = Math.min(1, p.baseAlpha + force * 0.6);
      } else {
        p.alpha = p.baseAlpha;
      }

      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -0.5;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -0.5;
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function parallax() {
    const moveX = (targetX - window.innerWidth / 2) * PARALLAX_STRENGTH;
    const moveY = (targetY - window.innerHeight / 2) * PARALLAX_STRENGTH;
    if (layers.stars1) layers.stars1.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
    if (layers.stars2) layers.stars2.style.transform = `translate(${moveX * 1.2}px, ${moveY * 1.2}px)`;
    if (layers.stars3) layers.stars3.style.transform = `translate(${moveX * 2}px, ${moveY * 2}px)`;
    if (layers.nebula) layers.nebula.style.transform = `translate(${moveX * 0.8}px, ${moveY * 0.8}px)`;
  }

  function animate() {
    drawParticles();
    parallax();
    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetX = e.clientX;
    targetY = e.clientY;
  });

  window.addEventListener('resize', resize);
  resize();
  animate();
}

const SHIPPING_COST = 9.99;
const FREE_SHIPPING_THRESHOLD = 100;

const DEFAULT_PRODUCTS = [
  { id: '1', name: 'Stellar Crystal', description: 'A crystallized fragment from a dying star. Emits a soft cosmic glow.', price: 49.99, image: '', category: 'Crystals' },
  { id: '2', name: 'Nebula Orb', description: 'Contains swirling clouds of interstellar gas. Perfect for meditation.', price: 89.99, image: '', category: 'Artifacts' },
  { id: '3', name: 'Void Stone', description: 'Mysterious black stone that absorbs light. Origin unknown.', price: 129.99, image: '', category: 'Crystals' },
  { id: '4', name: 'Aurora Shard', description: 'Frozen piece of the northern lights. Shimmers in multiple colors.', price: 64.99, image: '', category: 'Crystals' },
  { id: '5', name: 'Cosmic Compass', description: 'Points toward the nearest star. Never lose your way in the void.', price: 159.99, image: '', category: 'Tools' },
  { id: '6', name: 'Supernova Dust', description: 'Remnants of an ancient explosion. Sprinkle for good luck.', price: 24.99, image: '', category: 'Collectibles' }
];

const STORAGE_KEYS = {
  products: 'nebula_products',
  cart: 'nebula_cart',
  adminHash: 'nebula_admin_hash',
  adminUser: 'nebula_admin_user',
  orders: 'nebula_orders'
};

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function generateOrderId() {
  return 'NB' + Date.now().toString(36).toUpperCase().slice(-8);
}

let products = [];
let cart = [];
let orders = [];
let isAdminLoggedIn = false;
let checkoutData = { shipping: {}, payment: {} };

const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartShipping = document.getElementById('cartShipping');
const cartTotal = document.getElementById('cartTotal');
const storeView = document.getElementById('storeView');
const cartView = document.getElementById('cartView');
const checkoutView = document.getElementById('checkoutView');
const confirmView = document.getElementById('confirmView');
const ordersView = document.getElementById('ordersView');
const loginModal = document.getElementById('loginModal');
const adminModal = document.getElementById('adminModal');
const editModal = document.getElementById('editModal');
const productModal = document.getElementById('productModal');
const toast = document.getElementById('toast');

function init() {
  initInteractiveBg();
  loadProducts();
  loadCart();
  loadOrders();
  initAdmin();
  renderProducts();
  updateCartUI();
  populateCategoryFilter();
  setupEventListeners();
}

function loadProducts() {
  const stored = localStorage.getItem(STORAGE_KEYS.products);
  if (stored) {
    try { products = JSON.parse(stored); } catch { products = [...DEFAULT_PRODUCTS]; }
  } else {
    products = [...DEFAULT_PRODUCTS];
    saveProducts();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
}

function loadCart() {
  const stored = localStorage.getItem(STORAGE_KEYS.cart);
  if (stored) {
    try { cart = JSON.parse(stored); } catch { cart = []; }
  }
}

function saveCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
}

function loadOrders() {
  const stored = localStorage.getItem(STORAGE_KEYS.orders);
  if (stored) {
    try { orders = JSON.parse(stored); } catch { orders = []; }
  }
}

function saveOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

function initAdmin() {
  if (!localStorage.getItem(STORAGE_KEYS.adminHash)) {
    localStorage.setItem(STORAGE_KEYS.adminHash, simpleHash('nebula123'));
    localStorage.setItem(STORAGE_KEYS.adminUser, 'admin');
  }
}

function populateCategoryFilter() {
  const categories = [...new Set(products.map(p => p.category || 'Cosmic'))];
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '<option value="">All</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function getFilteredProducts() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  return products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search) || (p.description || '').toLowerCase().includes(search) || (p.category || '').toLowerCase().includes(search);
    const matchCategory = !category || (p.category || 'Cosmic') === category;
    return matchSearch && matchCategory;
  });
}

function renderProducts() {
  const filtered = getFilteredProducts();
  document.getElementById('noResults').style.display = filtered.length === 0 ? 'block' : 'none';
  productsGrid.style.display = filtered.length === 0 ? 'none' : 'grid';

  productsGrid.innerHTML = filtered.map(product => `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><span class="placeholder-icon" style="display:none">✦</span>` : '<span class="placeholder-icon">✦</span>'}
      </div>
      <div class="product-info">
        <span class="product-category">${product.category || 'Cosmic'}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description || ''}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <button class="btn-add-cart" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');

  productsGrid.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('btn-add-cart')) openProductModal(card.dataset.id);
    });
  });
  productsGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); addToCart(btn.dataset.id); });
  });
}

function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const content = document.getElementById('productDetailContent');
  content.innerHTML = `
    <div class="product-detail-image">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<span>✦</span>'}
    </div>
    <div class="product-detail-info">
      <span class="product-detail-category">${product.category || 'Cosmic'}</span>
      <h3>${product.name}</h3>
      <p class="product-detail-desc">${product.description || ''}</p>
      <div class="product-detail-price">$${product.price.toFixed(2)}</div>
      <button class="btn-primary btn-add-cart" data-id="${product.id}">Add to Cart</button>
    </div>
  `;
  content.querySelector('.btn-add-cart').addEventListener('click', () => { addToCart(productId); productModal.classList.remove('active'); });
  productModal.classList.add('active');
}

function addToCart(productId, quantity = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({ ...product, quantity });
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart');
}

function updateCartQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(productId);
  else { saveCart(); updateCartUI(); }
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getShippingCost() {
  const subtotal = getCartSubtotal();
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">Your cart is empty. Explore the cosmos!</div>';
    cartSubtotal.textContent = '$0.00';
    cartShipping.textContent = '$0.00';
    cartTotal.textContent = '$0.00';
    return;
  }

  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();
  cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
  cartShipping.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
  cartTotal.textContent = `$${(subtotal + shipping).toFixed(2)}`;

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<span>✦</span>'}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-qty">
        <button data-id="${item.id}" data-delta="-1">−</button>
        <span>${item.quantity}</span>
        <button data-id="${item.id}" data-delta="1">+</button>
      </div>
      <button class="cart-item-remove" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  cartItems.querySelectorAll('[data-delta]').forEach(btn => {
    btn.addEventListener('click', () => updateCartQuantity(btn.dataset.id, parseInt(btn.dataset.delta)));
  });
  cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

function showView(viewName) {
  [storeView, cartView, checkoutView, confirmView, ordersView].forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(link => link.classList.toggle('active', link.dataset.view === viewName));

  if (viewName === 'store') { storeView.classList.add('active'); renderProducts(); }
  else if (viewName === 'cart') cartView.classList.add('active');
  else if (viewName === 'checkout') {
    checkoutView.classList.add('active');
    setCheckoutStep(1);
  } else if (viewName === 'confirm') confirmView.classList.add('active');
  else if (viewName === 'orders') {
    ordersView.classList.add('active');
    renderOrders();
  }
}

function setCheckoutStep(step) {
  document.querySelectorAll('.checkout-steps .step').forEach((s, i) => s.classList.toggle('active', i + 1 <= step));
  document.querySelectorAll('.checkout-step-content').forEach((c, i) => c.classList.toggle('active', i + 1 === step));
}

function handleShippingSubmit(e) {
  e.preventDefault();
  checkoutData.shipping = {
    firstName: document.getElementById('shipFirstName').value.trim(),
    lastName: document.getElementById('shipLastName').value.trim(),
    email: document.getElementById('shipEmail').value.trim(),
    address: document.getElementById('shipAddress').value.trim(),
    city: document.getElementById('shipCity').value.trim(),
    postal: document.getElementById('shipPostal').value.trim(),
    country: document.getElementById('shipCountry').value.trim()
  };
  setCheckoutStep(2);
}

function handlePaymentSubmit(e) {
  e.preventDefault();
  checkoutData.payment = {
    cardNumber: document.getElementById('cardNumber').value,
    expiry: document.getElementById('cardExpiry').value,
    cvv: document.getElementById('cardCvv').value,
    name: document.getElementById('cardName').value
  };
  setCheckoutStep(3);
  renderReviewStep();
}

function renderReviewStep() {
  const s = checkoutData.shipping;
  document.getElementById('reviewAddress').textContent = `${s.firstName} ${s.lastName}, ${s.address}, ${s.city} ${s.postal}, ${s.country}`;
  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();
  document.getElementById('reviewItems').innerHTML = cart.map(item => `
    <div class="review-item">
      <span>${item.name} × ${item.quantity}</span>
      <span>$${(item.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');
  document.getElementById('reviewTotal').textContent = `$${(subtotal + shipping).toFixed(2)}`;
}

function placeOrder() {
  const orderId = generateOrderId();
  const subtotal = getCartSubtotal();
  const shipping = getShippingCost();

  orders.unshift({
    id: orderId,
    date: new Date().toISOString(),
    items: cart.map(i => ({ ...i })),
    shipping: { ...checkoutData.shipping },
    subtotal,
    shippingCost: shipping,
    total: subtotal + shipping
  });
  saveOrders();

  document.getElementById('orderNumber').textContent = orderId;
  cart = [];
  saveCart();
  updateCartUI();
  showView('confirm');
  showToast('Order placed successfully!');
}

function renderOrders() {
  const list = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  if (orders.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = orders.map(o => `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-card-id">Order #${o.id}</span>
        <span class="order-card-date">${new Date(o.date).toLocaleDateString()}</span>
      </div>
      <div class="order-card-items">${o.items.map(i => `${i.name} (×${i.quantity})`).join(', ')}</div>
      <div class="order-card-total">$${o.total.toFixed(2)}</div>
    </div>
  `).join('');
}

function openLoginModal() {
  loginModal.classList.add('active');
}

function closeLoginModal() {
  loginModal.classList.remove('active');
}

function login(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;
  const storedUser = localStorage.getItem(STORAGE_KEYS.adminUser);
  const storedHash = localStorage.getItem(STORAGE_KEYS.adminHash);
  if (user === storedUser && simpleHash(pass) === storedHash) {
    isAdminLoggedIn = true;
    closeLoginModal();
    openAdminModal();
  } else showToast('Invalid credentials', true);
}

function openAdminModal() {
  if (!isAdminLoggedIn) { openLoginModal(); return; }
  adminModal.classList.add('active');
  renderAdminProducts();
  renderAdminOrders();
  document.querySelector('.tab-btn.active')?.classList.remove('active');
  document.querySelector('[data-tab="products"]')?.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('productsTab').classList.add('active');
}

function closeAdminModal() {
  adminModal.classList.remove('active');
}

function renderAdminProducts() {
  const list = document.getElementById('adminProductsList');
  list.innerHTML = products.map(product => `
    <div class="admin-product-item">
      ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div class="admin-product-placeholder">✦</div>'}
      <div class="admin-product-info">
        <strong>${product.name}</strong>
        <span>$${product.price.toFixed(2)} · ${product.category || 'Cosmic'}</span>
      </div>
      <button class="btn-edit" data-id="${product.id}">Edit</button>
    </div>
  `).join('');
  list.querySelectorAll('.btn-edit').forEach(btn => btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
}

function renderAdminOrders() {
  const list = document.getElementById('adminOrdersList');
  if (!list) return;
  list.innerHTML = orders.length === 0 ? '<p style="color:var(--moon-glow)">No orders yet.</p>' : orders.map(o => `
    <div class="admin-order-item">
      <div class="admin-product-info">
        <strong>#${o.id}</strong>
        <span>${new Date(o.date).toLocaleDateString()} · $${o.total.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function openEditModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  document.getElementById('editProductId').value = product.id;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductDesc').value = product.description || '';
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductImage').value = product.image || '';
  document.getElementById('editProductCategory').value = product.category || '';
  editModal.classList.add('active');
}

function closeEditModal() {
  editModal.classList.remove('active');
}

function saveEdit(e) {
  e.preventDefault();
  const id = document.getElementById('editProductId').value;
  const product = products.find(p => p.id === id);
  if (!product) return;
  product.name = document.getElementById('editProductName').value.trim();
  product.description = document.getElementById('editProductDesc').value.trim();
  product.price = parseFloat(document.getElementById('editProductPrice').value) || 0;
  product.image = document.getElementById('editProductImage').value.trim();
  product.category = document.getElementById('editProductCategory').value.trim();
  saveProducts();
  renderProducts();
  renderAdminProducts();
  populateCategoryFilter();
  closeEditModal();
  showToast('Product updated!');
}

function deleteProduct() {
  const id = document.getElementById('editProductId').value;
  if (!confirm('Delete this product?')) return;
  products = products.filter(p => p.id !== id);
  cart = cart.filter(item => item.id !== id);
  saveProducts();
  saveCart();
  renderProducts();
  renderAdminProducts();
  updateCartUI();
  populateCategoryFilter();
  closeEditModal();
  showToast('Product deleted');
}

function addProduct(e) {
  e.preventDefault();
  const product = {
    id: Date.now().toString(),
    name: document.getElementById('productName').value.trim(),
    description: document.getElementById('productDesc').value.trim(),
    price: parseFloat(document.getElementById('productPrice').value) || 0,
    image: document.getElementById('productImage').value.trim(),
    category: document.getElementById('productCategory').value.trim() || 'Cosmic'
  };
  products.push(product);
  saveProducts();
  renderProducts();
  renderAdminProducts();
  populateCategoryFilter();
  e.target.reset();
  showToast('Product added!');
}

function changePassword(e) {
  e.preventDefault();
  localStorage.setItem(STORAGE_KEYS.adminHash, simpleHash(document.getElementById('newPassword').value));
  document.getElementById('newPassword').value = '';
  showToast('Password updated!');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const tabIds = { products: 'productsTab', add: 'addTab', 'orders-admin': 'ordersAdminTab', settings: 'settingsTab' };
  document.getElementById(tabIds[tabName])?.classList.add('active');
  if (tabName === 'products') renderAdminProducts();
  if (tabName === 'orders-admin') renderAdminOrders();
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.style.borderColor = isError ? '#e91e63' : 'var(--cosmic-cyan)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function setupEventListeners() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showView(link.dataset.view); });
  });

  document.querySelector('.logo')?.addEventListener('click', (e) => { e.preventDefault(); showView('store'); });

  document.getElementById('searchInput')?.addEventListener('input', () => renderProducts());
  document.getElementById('categoryFilter')?.addEventListener('change', () => renderProducts());

  document.getElementById('backToStore')?.addEventListener('click', () => showView('store'));
  document.getElementById('backToStoreFromOrders')?.addEventListener('click', () => showView('store'));
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (cart.length === 0) { showToast('Your cart is empty!', true); return; }
    showView('checkout');
  });

  document.getElementById('backToCart')?.addEventListener('click', () => showView('cart'));
  document.getElementById('shippingForm')?.addEventListener('submit', handleShippingSubmit);
  document.getElementById('paymentForm')?.addEventListener('submit', handlePaymentSubmit);
  document.getElementById('placeOrderBtn')?.addEventListener('click', placeOrder);
  document.getElementById('continueShoppingBtn')?.addEventListener('click', () => showView('store'));

  document.getElementById('adminBtn')?.addEventListener('click', openLoginModal);
  document.getElementById('closeLogin')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginForm')?.addEventListener('submit', login);
  document.getElementById('closeAdmin')?.addEventListener('click', closeAdminModal);
  document.getElementById('closeProductModal')?.addEventListener('click', () => productModal.classList.remove('active'));

  document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  document.getElementById('addProductForm')?.addEventListener('submit', addProduct);
  document.getElementById('changePasswordForm')?.addEventListener('submit', changePassword);
  document.getElementById('closeEdit')?.addEventListener('click', closeEditModal);
  document.getElementById('editProductForm')?.addEventListener('submit', saveEdit);
  document.getElementById('deleteProductBtn')?.addEventListener('click', deleteProduct);

  [loginModal, adminModal, editModal, productModal].forEach(modal => {
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [loginModal, adminModal, editModal, productModal].forEach(m => m?.classList.remove('active'));
    }
  });

  document.getElementById('cardNumber')?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    v = v.match(/.{1,4}/g)?.join(' ') || v;
    e.target.value = v;
  });
  document.getElementById('cardExpiry')?.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
    e.target.value = v.slice(0, 5);
  });
}

init();
