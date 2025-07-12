// ===== CONFIGURAÇÕES =====
const CONFIG = {
    API_BASE_URL: 'https://fastfood-vwtq.onrender.com',
    ENDPOINTS: {
        PRODUCTS: '/api/public/produtos',
        ORDERS: '/api/public/pedidos',
        CUSTOMERS: '/api/public/clientes',
        PAYMENTS: '/api/public/pagamentos',
        ADMIN_LOGIN: '/api/admin/auth/login',
        ADMIN_ORDERS: '/api/admin/pedidos',
        ADMIN_PRODUCTS: '/api/admin/produtos',
        ADMIN_CUSTOMERS: '/api/admin/clientes'
    },
    ADMIN_CREDENTIALS: {
        USERNAME: process.env.ADMIN_USERNAME || 'admin',
        PASSWORD: process.env.ADMIN_PASSWORD || 'admin123'
    }
};

// ===== ESTADO GLOBAL =====
const STATE = {
    products: [],
    cart: [],
    currentUser: null,
    isAdmin: false,
    adminToken: null,
    currentTab: 'orders',
    orders: [],
    customers: []
};

// ===== UTILITÁRIOS =====
const Utils = {
    formatPrice: (price) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    },

    showNotification: (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    getCategoryIcon: (category) => {
        const icons = {
            burgers: 'fas fa-hamburger',
            drinks: 'fas fa-glass-martini',
            sides: 'fas fa-french-fries',
            desserts: 'fas fa-ice-cream'
        };
        return icons[category] || 'fas fa-utensils';
    },

    getCategoryName: (category) => {
        const names = {
            burgers: 'Burgers',
            drinks: 'Bebidas',
            sides: 'Acompanhamentos',
            desserts: 'Sobremesas'
        };
        return names[category] || category;
    }
};

// ===== API SERVICE =====
const API = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (STATE.adminToken) {
            config.headers.Authorization = `Bearer ${STATE.adminToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getProducts() {
        return await this.request(CONFIG.ENDPOINTS.PRODUCTS);
    },

    async createOrder(orderData) {
        return await this.request(CONFIG.ENDPOINTS.ORDERS, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async getOrders() {
        return await this.request(CONFIG.ENDPOINTS.ADMIN_ORDERS);
    },

    async getCustomers() {
        return await this.request(CONFIG.ENDPOINTS.ADMIN_CUSTOMERS);
    },

    async adminLogin(username, password) {
        const response = await this.request(CONFIG.ADMIN_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.token) {
            STATE.adminToken = response.token;
            STATE.isAdmin = true;
            localStorage.setItem('adminToken', response.token);
        }
        
        return response;
    }
};

// ===== CART MANAGEMENT =====
const Cart = {
    addItem(product) {
        const existingItem = STATE.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            STATE.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateDisplay();
        this.saveToStorage();
    },

    removeItem(productId) {
        STATE.cart = STATE.cart.filter(item => item.id !== productId);
        this.updateDisplay();
        this.saveToStorage();
    },

    updateQuantity(productId, quantity) {
        const item = STATE.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.updateDisplay();
                this.saveToStorage();
            }
        }
    },

    getTotal() {
        return STATE.cart.reduce((total, item) => {
            return total + (item.preco * item.quantity);
        }, 0);
    },

    clear() {
        STATE.cart = [];
        this.updateDisplay();
        this.saveToStorage();
    },

    updateDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const totalAmount = document.getElementById('totalAmount');
        
        // Update cart count
        const totalItems = STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update cart items
        if (cartItems) {
            cartItems.innerHTML = STATE.cart.length === 0 
                ? '<p class="empty-cart">Seu carrinho está vazio</p>'
                : STATE.cart.map(item => `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.nome}</div>
                            <div class="cart-item-price">${Utils.formatPrice(item.preco)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                `).join('');
        }
        
        // Update total
        if (totalAmount) {
            totalAmount.textContent = Utils.formatPrice(this.getTotal());
        }
    },

    saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(STATE.cart));
    },

    loadFromStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            STATE.cart = JSON.parse(savedCart);
            this.updateDisplay();
        }
    }
};

// ===== ADMIN PANEL =====
const AdminPanel = {
    init() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        // Admin login buttons
        document.getElementById('adminLink')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('footerAdminLink')?.addEventListener('click', () => this.showLoginModal());
        
        // Admin modal events
        document.getElementById('closeAdmin')?.addEventListener('click', () => this.hideLoginModal());
        document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Admin panel events
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
    },

    showLoginModal() {
        document.getElementById('adminModal').classList.add('active');
    },

    hideLoginModal() {
        document.getElementById('adminModal').classList.remove('active');
    },

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        try {
            await API.adminLogin(username, password);
            this.hideLoginModal();
            this.showAdminPanel();
            Utils.showNotification('Login realizado com sucesso!', 'success');
        } catch (error) {
            Utils.showNotification('Credenciais inválidas!', 'error');
        }
    },

    showAdminPanel() {
        document.getElementById('adminPanel').classList.add('active');
        this.loadAdminData();
    },

    hideAdminPanel() {
        document.getElementById('adminPanel').classList.remove('active');
    },

    logout() {
        STATE.isAdmin = false;
        STATE.adminToken = null;
        localStorage.removeItem('adminToken');
        this.hideAdminPanel();
        Utils.showNotification('Logout realizado com sucesso!', 'success');
    },

    checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            STATE.adminToken = token;
            STATE.isAdmin = true;
        }
    },

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}Tab`);
        });
        
        STATE.currentTab = tabName;
        this.loadTabData(tabName);
    },

    async loadAdminData() {
        await Promise.all([
            this.loadTabData('orders'),
            this.loadTabData('customers'),
            this.loadTabData('analytics')
        ]);
    },

    async loadTabData(tabName) {
        switch (tabName) {
            case 'orders':
                await this.loadOrders();
                break;
            case 'products':
                await this.loadProducts();
                break;
            case 'customers':
                await this.loadCustomers();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    },

    async loadOrders() {
        try {
            const orders = await API.getOrders();
            STATE.orders = orders;
            
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = orders.length === 0 
                ? '<p>Nenhum pedido encontrado</p>'
                : orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <h4>Pedido #${order.id.slice(0, 8)}</h4>
                            <span class="order-status ${order.status}">${order.status}</span>
                        </div>
                        <div class="order-details">
                            <p><strong>Cliente:</strong> ${order.cliente?.nome || 'N/A'}</p>
                            <p><strong>Data:</strong> ${new Date(order.data_criacao).toLocaleString()}</p>
                            <p><strong>Total:</strong> ${Utils.formatPrice(order.total || 0)}</p>
                        </div>
                    </div>
                `).join('');
        } catch (error) {
            Utils.showNotification('Erro ao carregar pedidos', 'error');
        }
    },

    async loadProducts() {
        try {
            const products = await API.getProducts();
            STATE.products = products;
            
            const productsTable = document.getElementById('productsTable');
            productsTable.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Preço</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.nome}</td>
                                <td>${Utils.getCategoryName(product.categoria)}</td>
                                <td>${Utils.formatPrice(product.preco)}</td>
                                <td>
                                    <button class="btn btn-small" onclick="AdminPanel.editProduct('${product.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="AdminPanel.deleteProduct('${product.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            Utils.showNotification('Erro ao carregar produtos', 'error');
        }
    },

    async loadCustomers() {
        try {
            const customers = await API.getCustomers();
            STATE.customers = customers;
            
            const customersList = document.getElementById('customersList');
            customersList.innerHTML = customers.length === 0 
                ? '<p>Nenhum cliente encontrado</p>'
                : customers.map(customer => `
                    <div class="customer-card">
                        <div class="customer-info">
                            <h4>${customer.nome}</h4>
                            <p><strong>Email:</strong> ${customer.email}</p>
                            <p><strong>CPF:</strong> ${customer.cpf}</p>
                        </div>
                    </div>
                `).join('');
        } catch (error) {
            Utils.showNotification('Erro ao carregar clientes', 'error');
        }
    },

    async loadAnalytics() {
        try {
            // Simulate analytics data
            const todaySales = STATE.orders.reduce((total, order) => {
                const orderDate = new Date(order.data_criacao);
                const today = new Date();
                if (orderDate.toDateString() === today.toDateString()) {
                    return total + (order.total || 0);
                }
                return total;
            }, 0);
            
            const todayOrders = STATE.orders.filter(order => {
                const orderDate = new Date(order.data_criacao);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
            }).length;
            
            document.getElementById('todaySales').textContent = Utils.formatPrice(todaySales);
            document.getElementById('todayOrders').textContent = todayOrders;
            document.getElementById('activeCustomers').textContent = STATE.customers.length;
            
            // Most sold product
            const productCounts = {};
            STATE.orders.forEach(order => {
                order.itens?.forEach(item => {
                    const product = STATE.products.find(p => p.id === item.produto_id);
                    if (product) {
                        productCounts[product.nome] = (productCounts[product.nome] || 0) + item.quantidade;
                    }
                });
            });
            
            const topProduct = Object.entries(productCounts)
                .sort(([,a], [,b]) => b - a)[0];
            
            document.getElementById('topProduct').textContent = topProduct ? topProduct[0] : '-';
        } catch (error) {
            Utils.showNotification('Erro ao carregar analytics', 'error');
        }
    }
};

// ===== PRODUCTS MANAGEMENT =====
const Products = {
    async loadProducts() {
        try {
            const products = await API.getProducts();
            STATE.products = products;
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
            Utils.showNotification('Erro ao carregar produtos', 'error');
        }
    },

    renderProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) return;
        
        productsGrid.innerHTML = products.length === 0 
            ? '<p class="no-products">Nenhum produto encontrado</p>'
            : products.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <i class="${Utils.getCategoryIcon(product.categoria)}"></i>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.nome}</h3>
                        <p class="product-category">${Utils.getCategoryName(product.categoria)}</p>
                        <p class="product-price">${Utils.formatPrice(product.preco)}</p>
                        <button class="add-to-cart" onclick="Products.addToCart('${product.id}')">
                            <i class="fas fa-plus"></i> Adicionar
                        </button>
                    </div>
                </div>
            `).join('');
    },

    addToCart(productId) {
        const product = STATE.products.find(p => p.id === productId);
        if (product) {
            Cart.addItem(product);
            Utils.showNotification(`${product.nome} adicionado ao carrinho!`, 'success');
        }
    },

    filterByCategory(category) {
        const products = category === 'all' 
            ? STATE.products 
            : STATE.products.filter(product => product.categoria === category);
        
        this.renderProducts(products);
    }
};

// ===== CHECKOUT PROCESS =====
const Checkout = {
    async processOrder() {
        if (STATE.cart.length === 0) {
            Utils.showNotification('Carrinho vazio!', 'error');
            return;
        }

        try {
            const orderData = {
                cliente: {
                    nome: 'Cliente Padrão',
                    email: 'cliente@exemplo.com',
                    cpf: '000.000.000-00'
                },
                itens: STATE.cart.map(item => ({
                    produto_id: item.id,
                    quantidade: item.quantity,
                    preco: item.preco
                })),
                status: 'pendente'
            };

            const order = await API.createOrder(orderData);
            
            Cart.clear();
            CartSidebar.hide();
            
            Utils.showNotification('Pedido realizado com sucesso!', 'success');
            
            // Simulate order tracking
            this.showOrderConfirmation(order);
        } catch (error) {
            Utils.showNotification('Erro ao processar pedido', 'error');
        }
    },

    showOrderConfirmation(order) {
        const modal = document.createElement('div');
        modal.className = 'order-confirmation-modal';
        modal.innerHTML = `
            <div class="order-confirmation-content">
                <div class="order-confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h2>Pedido Confirmado!</h2>
                </div>
                <div class="order-confirmation-body">
                    <p><strong>Número do Pedido:</strong> #${order.id?.slice(0, 8) || 'N/A'}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total:</strong> ${Utils.formatPrice(Cart.getTotal())}</p>
                    <p>Seu pedido está sendo preparado!</p>
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
};

// ===== CART SIDEBAR =====
const CartSidebar = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('cartIcon')?.addEventListener('click', () => this.show());
        document.getElementById('closeCart')?.addEventListener('click', () => this.hide());
        document.getElementById('cartOverlay')?.addEventListener('click', () => this.hide());
        document.getElementById('checkoutBtn')?.addEventListener('click', () => Checkout.processOrder());
    },

    show() {
        document.getElementById('cartSidebar').classList.add('active');
        document.getElementById('cartOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    hide() {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }
};

// ===== NAVIGATION =====
const Navigation = {
    init() {
        this.bindEvents();
        this.handleScroll();
    },

    bindEvents() {
        // Mobile menu toggle
        document.getElementById('navToggle')?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Category filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Products.filterByCategory(btn.dataset.category);
            });
        });
    },

    toggleMobileMenu() {
        const navMenu = document.getElementById('navMenu');
        navMenu?.classList.toggle('active');
    },

    handleScroll() {
        window.addEventListener('scroll', Utils.debounce(() => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
        }, 100));
    }
};

// ===== FORM HANDLING =====
const Forms = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('contactForm')?.addEventListener('submit', (e) => this.handleContactForm(e));
    },

    async handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        Utils.showNotification('Mensagem enviada com sucesso!', 'success');
        e.target.reset();
    }
};

// ===== LOADING SCREEN =====
const LoadingScreen = {
    init() {
        this.hide();
    },

    show() {
        document.getElementById('loadingScreen').classList.remove('hidden');
    },

    hide() {
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 2000);
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🍔 BurgerHouse - Inicializando...');
    
    // Initialize all modules
    LoadingScreen.init();
    Navigation.init();
    CartSidebar.init();
    AdminPanel.init();
    Forms.init();
    
    // Load initial data
    await Products.loadProducts();
    Cart.loadFromStorage();
    
    // Hide loading screen
    LoadingScreen.hide();
    
    console.log('✅ BurgerHouse - Inicializado com sucesso!');
});

// ===== GLOBAL FUNCTIONS =====
window.Cart = Cart;
window.Products = Products;
window.AdminPanel = AdminPanel;
window.Checkout = Checkout;
window.Utils = Utils;