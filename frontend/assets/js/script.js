// API Configuration
const API_BASE_URL = 'https://fastfood-api.onrender.com';

// Mock data for fallback
const mockProducts = [
    {
        id: 1,
        nome: "X-Burger Clássico",
        descricao: "Hambúrguer com queijo, alface, tomate e molho especial",
        preco: 15.90,
        categoria: "burgers"
    },
    {
        id: 2,
        nome: "X-Bacon",
        descricao: "Hambúrguer com bacon crocante, queijo e molho barbecue",
        preco: 18.90,
        categoria: "burgers"
    },
    {
        id: 3,
        nome: "X-Frango",
        descricao: "Filé de frango grelhado com queijo e salada",
        preco: 16.90,
        categoria: "burgers"
    },
    {
        id: 4,
        nome: "Refrigerante Cola",
        descricao: "Refrigerante cola 350ml gelado",
        preco: 5.90,
        categoria: "drinks"
    },
    {
        id: 5,
        nome: "Suco Natural",
        descricao: "Suco natural de laranja 300ml",
        preco: 6.90,
        categoria: "drinks"
    },
    {
        id: 6,
        nome: "Batata Frita",
        descricao: "Porção de batatas fritas crocantes",
        preco: 8.90,
        categoria: "sides"
    },
    {
        id: 7,
        nome: "Onion Rings",
        descricao: "Anéis de cebola empanados e fritos",
        preco: 9.90,
        categoria: "sides"
    },
    {
        id: 8,
        nome: "Sorvete de Chocolate",
        descricao: "Sorvete cremoso de chocolate com calda",
        preco: 7.90,
        categoria: "desserts"
    },
    {
        id: 9,
        nome: "Milk Shake",
        descricao: "Milk shake de baunilha com chantilly",
        preco: 12.90,
        categoria: "desserts"
    }
];

// Cart state
let cart = [];
let currentCategory = 'all';
let apiProducts = [];
let useMockData = false;

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const totalAmount = document.getElementById('totalAmount');
const filterBtns = document.querySelectorAll('.filter-btn');
const checkoutBtn = document.getElementById('checkoutBtn');
const closeCartBtn = document.getElementById('closeCart');
const cartIcon = document.getElementById('cartIcon');
const cartOverlay = document.getElementById('cartOverlay');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCartDisplay();
    loadProductsFromAPI();
});

function setupEventListeners() {
    // Cart icon
    if (cartIcon) {
        cartIcon.addEventListener('click', openCart);
    }
    // Close cart
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    // Overlay
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    // Checkout
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function openCart() {
    if (cartSidebar) cartSidebar.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('active');
}
function closeCart() {
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('active');
}

// Load products from API
async function loadProductsFromAPI() {
    try {
        showLoadingState();
        const response = await fetch(`${API_BASE_URL}/v1/api/public/produtos`);
        if (response.ok) {
            apiProducts = await response.json();
            useMockData = false;
            loadProducts();
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        apiProducts = mockProducts;
        useMockData = true;
        showNotification('Usando dados de demonstração (API indisponível)', 'info');
        loadProducts();
    }
}

function showLoadingState() {
    if (!productsGrid) return;
    productsGrid.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Carregando produtos...</p>
        </div>
    `;
}

function loadProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';
    if (apiProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>Nenhum produto disponível</h3>
                <p>O cardápio está vazio no momento.</p>
            </div>
        `;
        return;
    }
    const filteredProducts = currentCategory === 'all' 
        ? apiProducts 
        : apiProducts.filter(product => product.categoria === currentCategory);
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <h3>Nenhum produto nesta categoria</h3>
                <p>Tente selecionar outra categoria.</p>
            </div>
        `;
        return;
    }
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    const name = product.nome;
    const description = product.descricao;
    const price = product.preco;
    const icon = getCategoryIcon(product.categoria);
    card.innerHTML = `
        <div class="product-image">
            <i class="${icon}"></i>
        </div>
        <div class="product-content">
            <h3 class="product-title">${name}</h3>
            <p class="product-description">${description}</p>
            <div class="product-footer">
                <span class="product-price">R$ ${price.toFixed(2)}</span>
                <button class="btn btn-primary" onclick="addToCart(${product.id})">
                    <i class="fas fa-plus"></i>
                    <span class="btn-text">Adicionar</span>
                </button>
            </div>
        </div>
    `;
    return card;
}

function getCategoryIcon(category) {
    switch (category) {
        case 'burgers': return 'fas fa-hamburger';
        case 'drinks': return 'fas fa-wine-bottle';
        case 'sides': return 'fas fa-french-fries';
        case 'desserts': return 'fas fa-ice-cream';
        default: return 'fas fa-utensils';
    }
}

function filterProducts(category) {
    currentCategory = category;
    loadProducts();
}

function addToCart(productId) {
    const product = apiProducts.find(p => p.id === productId);
    if (!product) return;
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartDisplay();
    showNotification(`${product.nome} adicionado ao carrinho!`);
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #64748b;">Seu carrinho está vazio</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.nome}</div>
                        <div class="cart-item-price">R$ ${item.preco.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <button class="btn btn-outline" onclick="removeFromCart(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                cartItems.appendChild(cartItem);
            });
        }
    }
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    if (totalAmount) totalAmount.textContent = `R$ ${total.toFixed(2)}`;
}

function updateQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    updateCartDisplay();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    updateCartDisplay();
}

async function checkout() {
    if (cart.length === 0) {
        showNotification('Adicione itens ao carrinho primeiro!', 'error');
        return;
    }
    const total = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    if (useMockData) {
        showNotification('Demonstração: Pedido processado com sucesso!', 'success');
        cart = [];
        updateCartDisplay();
        closeCart();
        return;
    }
    try {
        showNotification('Processando pedido...', 'info');
        const orderData = {
            items: cart.map(item => ({
                produto_id: item.id,
                quantidade: item.quantity,
                preco_unitario: item.preco
            })),
            total: total
        };
        const response = await fetch(`${API_BASE_URL}/v1/api/public/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (response.ok) {
            const result = await response.json();
            showNotification(`Pedido criado com sucesso! ID: ${result.id}`, 'success');
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        showNotification('Erro ao processar pedido. Tente novamente.', 'error');
        return;
    }
    cart = [];
    updateCartDisplay();
    closeCart();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        font-size: 14px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations and states
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-weight: 500;
    }
    
    .loading-state, .error-state, .empty-state {
        text-align: center;
        padding: 3rem;
        color: #6b7280;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }
    
    .error-state i, .empty-state i {
        font-size: 3rem;
        color: #ef4444;
        margin-bottom: 1rem;
    }
    
    .empty-state i {
        color: #6b7280;
    }
    
    .loading-state h3, .error-state h3, .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #1f2937;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// Simulate API health check
function checkAPIHealth() {
    return fetch(`${API_BASE_URL}/health`)
        .then(response => response.json())
        .then(data => ({ status: data.status, responseTime: '45ms' }))
        .catch(() => ({ status: 'unavailable', responseTime: 'N/A' }));
}

// Update stats periodically
setInterval(async () => {
    const health = await checkAPIHealth();
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 1) {
        statNumbers[1].textContent = health.responseTime;
    }
}, 10000);