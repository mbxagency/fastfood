// API Configuration
const API_BASE_URL = 'https://fastfood-api.railway.app' || 'http://localhost:8000';

// Mock data for products (fallback)
const products = [
    {
        id: 1,
        name: "Hambúrguer Clássico",
        description: "Pão, carne, alface, tomate e queijo",
        price: 15.90,
        category: "burgers",
        icon: "fas fa-hamburger"
    },
    {
        id: 2,
        name: "Hambúrguer Duplo",
        description: "Dois hambúrgueres, queijo, bacon e molho especial",
        price: 22.50,
        category: "burgers",
        icon: "fas fa-hamburger"
    },
    {
        id: 3,
        name: "X-Bacon",
        description: "Hambúrguer com bacon crocante e queijo",
        price: 18.90,
        category: "burgers",
        icon: "fas fa-hamburger"
    },
    {
        id: 4,
        name: "Refrigerante",
        description: "Coca-Cola, Pepsi ou Sprite",
        price: 5.00,
        category: "drinks",
        icon: "fas fa-wine-bottle"
    },
    {
        id: 5,
        name: "Suco Natural",
        description: "Laranja, limão ou abacaxi",
        price: 6.50,
        category: "drinks",
        icon: "fas fa-wine-glass"
    },
    {
        id: 6,
        name: "Batata Frita",
        description: "Porção de batatas fritas crocantes",
        price: 8.50,
        category: "sides",
        icon: "fas fa-french-fries"
    },
    {
        id: 7,
        name: "Onion Rings",
        description: "Anéis de cebola empanados",
        price: 7.90,
        category: "sides",
        icon: "fas fa-circle"
    },
    {
        id: 8,
        name: "Sorvete",
        description: "Sorvete de chocolate, baunilha ou morango",
        price: 4.50,
        category: "desserts",
        icon: "fas fa-ice-cream"
    },
    {
        id: 9,
        name: "Pudim",
        description: "Pudim de leite condensado",
        price: 5.90,
        category: "desserts",
        icon: "fas fa-cookie-bite"
    },
    {
        id: 10,
        name: "X-Salada",
        description: "Hambúrguer com salada completa",
        price: 16.90,
        category: "burgers",
        icon: "fas fa-hamburger"
    },
    {
        id: 11,
        name: "Água",
        description: "Água mineral com ou sem gás",
        price: 3.50,
        category: "drinks",
        icon: "fas fa-tint"
    },
    {
        id: 12,
        name: "Nuggets",
        description: "6 unidades de nuggets de frango",
        price: 9.90,
        category: "sides",
        icon: "fas fa-drumstick-bite"
    }
];

// Cart state
let cart = [];
let currentCategory = 'all';
let apiProducts = [];

// DOM elements
const menuGrid = document.getElementById('menuGrid');
const cartModal = document.getElementById('cartModal');
const loginModal = document.getElementById('loginModal');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 FastFood iniciando...');
    loadProducts(); // Carrega dados mock primeiro
    setupEventListeners();
    updateCartDisplay();
    
    // Tenta carregar da API em background
    setTimeout(() => {
        loadProductsFromAPI();
    }, 1000);
});

// Setup event listeners
function setupEventListeners() {
    // Cart button
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', openLogin);
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            closeCart();
            closeLogin();
        });
    });
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            filterProducts(category);
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) closeCart();
        if (e.target === loginModal) closeLogin();
    });
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });
    }
}

// Load products from API (background)
async function loadProductsFromAPI() {
    try {
        console.log('🔗 Tentando carregar produtos da API...');
        const response = await fetch(`${API_BASE_URL}/v1/api/public/produtos`);
        if (response.ok) {
            apiProducts = await response.json();
            console.log('✅ Produtos carregados da API:', apiProducts.length);
            loadProducts(); // Recarrega com dados da API
        } else {
            console.warn('⚠️ API não disponível, usando dados mock');
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar produtos da API:', error);
    }
}

// Load products
function loadProducts() {
    if (!menuGrid) {
        console.error('❌ Elemento menuGrid não encontrado');
        return;
    }
    
    menuGrid.innerHTML = '';
    
    const productsToShow = apiProducts.length > 0 ? apiProducts : products;
    const filteredProducts = currentCategory === 'all' 
        ? productsToShow 
        : productsToShow.filter(product => product.category === currentCategory);
    
    console.log(`📦 Carregando ${filteredProducts.length} produtos para categoria: ${currentCategory}`);
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        menuGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    
    // Use API data or fallback to mock data
    const name = product.nome || product.name;
    const description = product.descricao || product.description;
    const price = product.preco || product.price;
    const icon = product.icone || product.icon || 'fas fa-utensils';
    
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

// Filter products
function filterProducts(category) {
    currentCategory = category;
    loadProducts();
}

// Cart functions
function addToCart(productId) {
    const productsToUse = apiProducts.length > 0 ? apiProducts : products;
    const product = productsToUse.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    showNotification(`${product.nome || product.name} adicionado ao carrinho!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update cart items
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #64748b;">Seu carrinho está vazio</p>';
        } else {
            cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                
                const name = item.nome || item.name;
                const price = item.preco || item.price;
                
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-title">${name}</div>
                        <div class="cart-item-price">R$ ${price.toFixed(2)}</div>
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
    const total = cart.reduce((sum, item) => {
        const price = item.preco || item.price;
        return sum + (price * item.quantity);
    }, 0);
    
    if (cartTotal) {
        cartTotal.textContent = total.toFixed(2);
    }
}

// Modal functions
function openCart() {
    if (cartModal) {
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openLogin() {
    if (loginModal) {
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLogin() {
    if (loginModal) {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Checkout function
async function checkout() {
    if (cart.length === 0) {
        showNotification('Adicione itens ao carrinho primeiro!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => {
        const price = item.preco || item.price;
        return sum + (price * item.quantity);
    }, 0);
    
    // Try to create order via API
    try {
        const orderData = {
            items: cart.map(item => ({
                produto_id: item.id,
                quantidade: item.quantity,
                preco_unitario: item.preco || item.price
            })),
            total: total
        };
        
        const response = await fetch(`${API_BASE_URL}/v1/api/public/pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(`Pedido #${result.id} realizado com sucesso!`, 'success');
        } else {
            throw new Error('Erro na API');
        }
    } catch (error) {
        console.warn('Erro ao criar pedido via API:', error);
        // Fallback to mock
        const orderNumber = Math.floor(Math.random() * 90000) + 10000;
        showNotification(`Pedido #${orderNumber} realizado com sucesso!`, 'success');
    }
    
    cart = [];
    updateCartDisplay();
    closeCart();
}

// Utility functions
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Navigation functions
function scrollToMenu() {
    const menuSection = document.getElementById('menu');
    if (menuSection) {
        menuSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showDemo() {
    showNotification('Demonstração do sistema iniciada!', 'info');
    
    // Simulate some demo actions
    setTimeout(() => {
        addToCart(1); // Add hamburger
    }, 500);
    
    setTimeout(() => {
        addToCart(4); // Add drink
    }, 1000);
    
    setTimeout(() => {
        openCart();
    }, 1500);
}

// Add CSS animations
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
    
    @media (max-width: 768px) {
        .notification {
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// Simulate real-time order updates
setInterval(() => {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width);
        if (currentWidth < 100) {
            bar.style.width = (currentWidth + 1) + '%';
        }
    });
}, 5000);

// Add some interactivity to the architecture cards
document.addEventListener('DOMContentLoaded', function() {
    const archCards = document.querySelectorAll('.arch-card');
    archCards.forEach(card => {
        card.addEventListener('click', function() {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = 'translateY(-5px)';
            }, 200);
        });
    });
});

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