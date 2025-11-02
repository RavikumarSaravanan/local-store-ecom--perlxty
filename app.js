// Data Structure
let products = [
  { id: 1, name: "Organic Rice", price: 450, category: "Grains", description: "High-quality organic basmati rice, 5kg pack", stock: 50, image: "🍚" },
  { id: 2, name: "Palm Oil", price: 320, category: "Oils", description: "Pure refined palm oil, 2L bottle", stock: 30, image: "🥫" },
  { id: 3, name: "Coconut Milk", price: 85, category: "Beverages", description: "Freshly extracted coconut milk, 1L", stock: 45, image: "🥥" },
  { id: 4, name: "Spice Mix", price: 150, category: "Spices", description: "Traditional masala blend, 200g", stock: 60, image: "🌶️" },
  { id: 5, name: "Jaggery", price: 180, category: "Sweeteners", description: "Organic jaggery blocks, 1kg", stock: 25, image: "🍯" },
  { id: 6, name: "Dried Fish", price: 420, category: "Seafood", description: "Premium dried fish, 500g pack", stock: 15, image: "🐟" }
];

let customers = [];
let orders = [];
let orderItems = [];
let cart = [];
let isAdminLoggedIn = false;
let currentOrderId = 1;
let currentCustomerId = 1;
let currentProductId = 7;

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

// Initialize app
function init() {
  renderProducts();
  updateCartBadge();
  attachEventListeners();
  updateAdminUI();
}

// Attach event listeners
function attachEventListeners() {
  // Search and filter
  document.getElementById('searchInput').addEventListener('input', filterProducts);
  document.getElementById('categoryFilter').addEventListener('change', filterProducts);

  // Cart
  document.getElementById('cartBtn').addEventListener('click', openCartModal);
  document.getElementById('closeCartBtn').addEventListener('click', closeCartModal);
  document.getElementById('continueShoppingBtn').addEventListener('click', closeCartModal);
  document.getElementById('placeOrderBtn').addEventListener('click', openOrderForm);

  // Order form
  document.getElementById('closeOrderFormBtn').addEventListener('click', closeOrderFormModal);
  document.getElementById('cancelOrderBtn').addEventListener('click', closeOrderFormModal);
  document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);

  // Order confirmation
  document.getElementById('continueShoppingConfirmBtn').addEventListener('click', closeOrderConfirmationModal);

  // Admin login
  document.getElementById('adminLoginBtn').addEventListener('click', openAdminLoginModal);
  document.getElementById('closeAdminLoginBtn').addEventListener('click', closeAdminLoginModal);
  document.getElementById('loginBtn').addEventListener('click', adminLogin);
  document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);

  // Admin tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', switchTab);
  });

  // Add product form
  document.getElementById('addProductForm').addEventListener('submit', addProduct);

  // Edit product
  document.getElementById('closeEditProductBtn').addEventListener('click', closeEditProductModal);
  document.getElementById('cancelEditBtn').addEventListener('click', closeEditProductModal);
  document.getElementById('updateProductBtn').addEventListener('click', updateProduct);

  // Order details
  document.getElementById('closeOrderDetailsBtn').addEventListener('click', closeOrderDetailsModal);
  document.getElementById('closeOrderDetailsActionBtn').addEventListener('click', closeOrderDetailsModal);

  // Order search
  document.getElementById('orderSearchInput').addEventListener('input', filterOrders);

  // My Orders
  document.getElementById('myOrdersBtn').addEventListener('click', openMyOrdersModal);
  document.getElementById('closeMyOrdersBtn').addEventListener('click', closeMyOrdersModal);
  document.getElementById('searchMyOrdersBtn').addEventListener('click', searchMyOrders);
}

// Render products
function renderProducts() {
  const productGrid = document.getElementById('productGrid');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const categoryFilter = document.getElementById('categoryFilter').value;

  let filteredProducts = products;

  // Filter by search term
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by category
  if (categoryFilter !== 'All') {
    filteredProducts = filteredProducts.filter(product => 
      product.category === categoryFilter
    );
  }

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); grid-column: 1/-1;">No products found.</p>';
    return;
  }

  productGrid.innerHTML = filteredProducts.map(product => `
    <div class="product-card">
      <div class="product-image">${product.image}</div>
      <h3 class="product-name">${product.name}</h3>
      <span class="product-category">${product.category}</span>
      <div class="product-price">₹${product.price.toFixed(2)}</div>
      <p class="product-description">${product.description}</p>
      <p class="product-stock ${product.stock > 0 ? (product.stock < 10 ? 'stock-low' : 'stock-in') : 'stock-out'}">
        ${product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
      </p>
      <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  `).join('');
}

// Filter products
function filterProducts() {
  renderProducts();
}

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.stock === 0) return;

  const cartItem = cart.find(item => item.productId === productId);
  
  if (cartItem) {
    if (cartItem.quantity < product.stock) {
      cartItem.quantity++;
    } else {
      showToast('Cannot add more than available stock', 'error');
      return;
    }
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      maxStock: product.stock
    });
  }

  updateCartBadge();
  showToast(`${product.name} added to cart!`, 'success');
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = totalItems;
}

// Open cart modal
function openCartModal() {
  renderCart();
  document.getElementById('cartModal').classList.add('active');
}

// Close cart modal
function closeCartModal() {
  document.getElementById('cartModal').classList.remove('active');
}

// Render cart
function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="cart-empty">Your cart is empty</div>';
    placeOrderBtn.disabled = true;
    updateCartSummary();
    return;
  }

  placeOrderBtn.disabled = false;

  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">${item.image}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, -1)">-</button>
        <span class="quantity-value">${item.quantity}</span>
        <button class="quantity-btn" onclick="updateCartQuantity(${item.productId}, 1)">+</button>
      </div>
      <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
      <button class="remove-btn" onclick="removeFromCart(${item.productId})">Remove</button>
    </div>
  `).join('');

  updateCartSummary();
}

// Update cart quantity
function updateCartQuantity(productId, change) {
  const cartItem = cart.find(item => item.productId === productId);
  if (!cartItem) return;

  const product = products.find(p => p.id === productId);
  const newQuantity = cartItem.quantity + change;

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  if (newQuantity > product.stock) {
    showToast('Cannot exceed available stock', 'error');
    return;
  }

  cartItem.quantity = newQuantity;
  cartItem.maxStock = product.stock;
  updateCartBadge();
  renderCart();
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  updateCartBadge();
  renderCart();
  showToast('Item removed from cart', 'success');
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  document.getElementById('cartSubtotal').textContent = `₹${subtotal.toFixed(2)}`;
  document.getElementById('cartTax').textContent = `₹${tax.toFixed(2)}`;
  document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;
}

// Open order form
function openOrderForm() {
  closeCartModal();
  document.getElementById('orderFormModal').classList.add('active');
}

// Close order form modal
function closeOrderFormModal() {
  document.getElementById('orderFormModal').classList.remove('active');
  document.getElementById('orderForm').reset();
}

// Submit order
function submitOrder() {
  const name = document.getElementById('customerName').value.trim();
  const email = document.getElementById('customerEmail').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();

  // Validation
  if (!name || !email || !phone || !address) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast('Please enter a valid email address', 'error');
    return;
  }

  // Phone validation
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Please enter a valid 10-digit phone number', 'error');
    return;
  }

  // Create customer
  const customer = {
    id: currentCustomerId++,
    name,
    email,
    phone,
    address,
    registration_date: new Date().toISOString()
  };
  customers.push(customer);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // Create order
  const orderId = `ORD${Date.now()}`;
  const order = {
    id: orderId,
    customer_id: customer.id,
    customer_name: name,
    customer_email: email,
    order_date: new Date().toISOString(),
    status: 'Pending',
    total_amount: total,
    subtotal,
    tax
  };
  orders.push(order);

  // Create order items and update stock
  cart.forEach(item => {
    orderItems.push({
      id: orderItems.length + 1,
      order_id: orderId,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      price_at_purchase: item.price
    });

    // Update product stock
    const product = products.find(p => p.id === item.productId);
    if (product) {
      product.stock -= item.quantity;
    }
  });

  // Show order confirmation
  showOrderConfirmation(order, customer);

  // Clear cart
  cart = [];
  updateCartBadge();

  // Close order form
  closeOrderFormModal();

  // Update products display
  renderProducts();

  // Update admin dashboard if logged in
  if (isAdminLoggedIn) {
    updateAdminDashboard();
  }
}

// Show order confirmation
function showOrderConfirmation(order, customer) {
  const items = orderItems.filter(item => item.order_id === order.id);
  
  const confirmationHTML = `
    <div class="order-info">
      <h3>Order ID: ${order.id}</h3>
      <p><strong>Customer:</strong> ${customer.name}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Phone:</strong> ${customer.phone}</p>
      <p><strong>Address:</strong> ${customer.address}</p>
      <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
    </div>
    
    <div class="order-items-list">
      <h3>Order Items:</h3>
      ${items.map(item => `
        <div class="order-item">
          <span>${item.product_name} x ${item.quantity}</span>
          <span>₹${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>

    <div class="order-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>₹${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (5%):</span>
        <span>₹${order.tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>₹${order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  `;

  document.getElementById('orderConfirmationDetails').innerHTML = confirmationHTML;
  document.getElementById('orderConfirmationModal').classList.add('active');
}

// Close order confirmation modal
function closeOrderConfirmationModal() {
  document.getElementById('orderConfirmationModal').classList.remove('active');
}

// Open admin login modal
function openAdminLoginModal() {
  document.getElementById('adminLoginModal').classList.add('active');
  document.getElementById('loginError').style.display = 'none';
}

// Close admin login modal
function closeAdminLoginModal() {
  document.getElementById('adminLoginModal').classList.remove('active');
  document.getElementById('adminLoginForm').reset();
  document.getElementById('loginError').style.display = 'none';
}

// Admin login
function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    isAdminLoggedIn = true;
    closeAdminLoginModal();
    showAdminView();
    showToast('Login successful!', 'success');
  } else {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = 'Invalid username or password';
    errorDiv.style.display = 'block';
  }
}

// Admin logout
function adminLogout() {
  isAdminLoggedIn = false;
  showCustomerView();
  showToast('Logged out successfully', 'success');
}

// Update admin UI
function updateAdminUI() {
  const adminLoginBtn = document.getElementById('adminLoginBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');

  if (isAdminLoggedIn) {
    adminLoginBtn.style.display = 'none';
    adminLogoutBtn.style.display = 'inline-flex';
  } else {
    adminLoginBtn.style.display = 'inline-flex';
    adminLogoutBtn.style.display = 'none';
  }
}

// Show admin view
function showAdminView() {
  document.getElementById('customerView').style.display = 'none';
  document.getElementById('adminView').style.display = 'block';
  updateAdminUI();
  updateAdminDashboard();
  renderProductTable();
  renderOrderTable();
}

// Show customer view
function showCustomerView() {
  document.getElementById('customerView').style.display = 'block';
  document.getElementById('adminView').style.display = 'none';
  updateAdminUI();
  renderProducts();
}

// Update admin dashboard
function updateAdminDashboard() {
  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalOrders').textContent = orders.length;
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
}

// Switch admin tab
function switchTab(e) {
  const tabName = e.target.dataset.tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  // Show/hide tab content
  if (tabName === 'products') {
    document.getElementById('productsTab').style.display = 'block';
    document.getElementById('ordersTab').style.display = 'none';
    renderProductTable();
  } else if (tabName === 'orders') {
    document.getElementById('productsTab').style.display = 'none';
    document.getElementById('ordersTab').style.display = 'block';
    renderOrderTable();
  }
}

// Add product
function addProduct(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const category = document.getElementById('productCategory').value;
  const stock = parseInt(document.getElementById('productStock').value);
  const description = document.getElementById('productDescription').value.trim();
  const image = document.getElementById('productImage').value.trim();

  if (!name || !price || !category || stock < 0 || !description || !image) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const newProduct = {
    id: currentProductId++,
    name,
    price,
    category,
    description,
    stock,
    image
  };

  products.push(newProduct);
  document.getElementById('addProductForm').reset();
  renderProductTable();
  renderProducts();
  updateAdminDashboard();
  showToast('Product added successfully!', 'success');
}

// Render product table
function renderProductTable() {
  const tbody = document.getElementById('productTableBody');
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No products available</td></tr>';
    return;
  }

  tbody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td style="font-size: 24px;">${product.image}</td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>₹${product.price.toFixed(2)}</td>
      <td class="${product.stock < 5 ? 'stock-low' : ''}">${product.stock}</td>
      <td>${product.description}</td>
      <td>
        <button class="btn btn--sm btn--outline action-btn" onclick="openEditProduct(${product.id})">Edit</button>
        <button class="btn btn--sm btn--danger" onclick="deleteProduct(${product.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Open edit product modal
function openEditProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.getElementById('editProductId').value = product.id;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductCategory').value = product.category;
  document.getElementById('editProductStock').value = product.stock;
  document.getElementById('editProductDescription').value = product.description;
  document.getElementById('editProductImage').value = product.image;

  document.getElementById('editProductModal').classList.add('active');
}

// Close edit product modal
function closeEditProductModal() {
  document.getElementById('editProductModal').classList.remove('active');
  document.getElementById('editProductForm').reset();
}

// Update product
function updateProduct() {
  const id = parseInt(document.getElementById('editProductId').value);
  const name = document.getElementById('editProductName').value.trim();
  const price = parseFloat(document.getElementById('editProductPrice').value);
  const category = document.getElementById('editProductCategory').value;
  const stock = parseInt(document.getElementById('editProductStock').value);
  const description = document.getElementById('editProductDescription').value.trim();
  const image = document.getElementById('editProductImage').value.trim();

  if (!name || !price || !category || stock < 0 || !description || !image) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const product = products.find(p => p.id === id);
  if (product) {
    product.name = name;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.description = description;
    product.image = image;

    closeEditProductModal();
    renderProductTable();
    renderProducts();
    showToast('Product updated successfully!', 'success');
  }
}

// Delete product
function deleteProduct(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (confirm(`Are you sure you want to delete ${product.name}?`)) {
    products = products.filter(p => p.id !== productId);
    renderProductTable();
    renderProducts();
    updateAdminDashboard();
    showToast('Product deleted successfully', 'success');
  }
}

// Render order table
function renderOrderTable() {
  const tbody = document.getElementById('orderTableBody');
  const searchTerm = document.getElementById('orderSearchInput').value.toLowerCase();
  
  let filteredOrders = orders;
  if (searchTerm) {
    filteredOrders = orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm) ||
      order.customer_name.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = filteredOrders.map(order => `
    <tr>
      <td>${order.id}</td>
      <td>${order.customer_name}</td>
      <td>${order.customer_email}</td>
      <td>${new Date(order.order_date).toLocaleDateString()}</td>
      <td>₹${order.total_amount.toFixed(2)}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
          <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <button class="btn btn--sm btn--outline" onclick="viewOrderDetails('${order.id}')">View Details</button>
      </td>
    </tr>
  `).join('');
}

// Filter orders
function filterOrders() {
  renderOrderTable();
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    showToast('Order status updated', 'success');
  }
}

// View order details
function viewOrderDetails(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const items = orderItems.filter(item => item.order_id === orderId);
  const customer = customers.find(c => c.id === order.customer_id);

  const detailsHTML = `
    <div class="order-info">
      <h3>Order ID: ${order.id}</h3>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Customer:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      ${customer ? `
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Address:</strong> ${customer.address}</p>
      ` : ''}
      <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
    </div>
    
    <div class="order-items-list">
      <h3>Order Items:</h3>
      ${items.map(item => `
        <div class="order-item">
          <span>${item.product_name} x ${item.quantity}</span>
          <span>₹${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
        </div>
      `).join('')}
    </div>

    <div class="order-summary">
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>₹${order.subtotal.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (5%):</span>
        <span>₹${order.tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total:</span>
        <span>₹${order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  `;

  document.getElementById('orderDetailsContent').innerHTML = detailsHTML;
  document.getElementById('orderDetailsModal').classList.add('active');
}

// Close order details modal
function closeOrderDetailsModal() {
  document.getElementById('orderDetailsModal').classList.remove('active');
}

// Open my orders modal
function openMyOrdersModal() {
  document.getElementById('myOrdersModal').classList.add('active');
  document.getElementById('myOrdersList').innerHTML = '';
}

// Close my orders modal
function closeMyOrdersModal() {
  document.getElementById('myOrdersModal').classList.remove('active');
  document.getElementById('myOrdersEmail').value = '';
  document.getElementById('myOrdersList').innerHTML = '';
}

// Search my orders
function searchMyOrders() {
  const email = document.getElementById('myOrdersEmail').value.trim().toLowerCase();
  
  if (!email) {
    showToast('Please enter your email', 'error');
    return;
  }

  const customerOrders = orders.filter(order => order.customer_email.toLowerCase() === email);
  const myOrdersList = document.getElementById('myOrdersList');

  if (customerOrders.length === 0) {
    myOrdersList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">No orders found for this email.</p>';
    return;
  }

  myOrdersList.innerHTML = `
    <h3 style="margin-bottom: 16px;">Your Orders (${customerOrders.length})</h3>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${customerOrders.map(order => `
            <tr>
              <td>${order.id}</td>
              <td>${new Date(order.order_date).toLocaleDateString()}</td>
              <td>₹${order.total_amount.toFixed(2)}</td>
              <td><span class="status status--${getStatusClass(order.status)}">${order.status}</span></td>
              <td>
                <button class="btn btn--sm btn--outline" onclick="viewOrderDetails('${order.id}')">View</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Get status class
function getStatusClass(status) {
  switch(status) {
    case 'Delivered': return 'success';
    case 'Shipped': return 'info';
    case 'Confirmed': return 'warning';
    default: return 'error';
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize app on page load
window.addEventListener('DOMContentLoaded', init);