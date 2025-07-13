// ===== CONFIGURAÇÕES =====
const CONFIG = {
    API_BASE_URL: 'https://fastfood-vwtq.onrender.com',
    ENDPOINTS: {
        PRODUCTS: '/v1/api/public/produtos/',
        ORDERS: '/v1/api/public/pedidos/',
        CUSTOMERS: '/v1/api/public/clientes/',
        PAYMENTS: '/v1/api/public/pagamento/',
        ADMIN_LOGIN: '/v1/api/public/login',
        ADMIN_ORDERS: '/v1/api/admin/pedidos/',
        ADMIN_PRODUCTS: '/v1/api/admin/produtos/',
        ADMIN_CUSTOMERS: '/v1/api/admin/clientes/'
    },
    ADMIN_CREDENTIALS: {
        USERNAME: 'admin',
        PASSWORD: 'postech'
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
            mode: 'cors',
            credentials: 'omit',
            ...options
        };

        if (STATE.adminToken) {
            config.headers.Authorization = `Bearer ${STATE.adminToken}`;
        }

        console.log('🌐 API Request:', { url, method: options.method || 'GET', body: options.body });
        console.log('🌐 API Config:', config);

        try {
            const response = await fetch(url, config);
            console.log('🌐 API Response status:', response.status);
            console.log('🌐 API Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🌐 API Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('🌐 API Response data:', data);
            return data;
        } catch (error) {
            console.error('❌ API Error:', error);
            console.error('❌ API Error details:', { url, config, error: error.message });
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

    async createCustomer(customerData) {
        return await this.request(CONFIG.ENDPOINTS.CUSTOMERS, {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    },

    async getOrders() {
        return await this.request(CONFIG.ENDPOINTS.ADMIN_ORDERS);
    },

    async getCustomers() {
        return await this.request(CONFIG.ENDPOINTS.ADMIN_CUSTOMERS);
    },

    async adminLogin(username, password) {
        console.log('🔑 API: Login attempt for username:', username);
        console.log('🔑 API: Endpoint:', CONFIG.ENDPOINTS.ADMIN_LOGIN);
        
        // Create FormData for login (backend expects form data)
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN_LOGIN}`, {
            method: 'POST',
            body: formData
        });
        
        console.log('🔑 API: Login response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🔑 API: Login response data:', data);
        
        if (data.access_token) {
            STATE.adminToken = data.access_token;
            STATE.isAdmin = true;
            localStorage.setItem('adminToken', data.access_token);
            console.log('✅ API: Token saved successfully');
        }
        
        return data;
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
        const adminLink = document.getElementById('adminLink');
        const footerAdminLink = document.getElementById('footerAdminLink');
        
        console.log('🔍 Admin buttons found:', { adminLink: !!adminLink, footerAdminLink: !!footerAdminLink });
        
        adminLink?.addEventListener('click', () => {
            console.log('🔑 Admin button clicked');
            this.showLoginModal();
        });
        
        footerAdminLink?.addEventListener('click', () => {
            console.log('🔑 Footer admin button clicked');
            this.showLoginModal();
        });
        
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
        console.log('🔑 Showing login modal');
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('active');
            console.log('✅ Modal shown');
        } else {
            console.error('❌ Modal not found');
        }
    },

    hideLoginModal() {
        document.getElementById('adminModal').classList.remove('active');
    },

    async handleLogin(e) {
        e.preventDefault();
        
        console.log('🔑 Login attempt started');
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        console.log('🔑 Credentials:', { username, password: password ? '***' : 'empty' });
        
        try {
            console.log('🔑 Calling API login...');
            await API.adminLogin(username, password);
            console.log('✅ Login successful');
            this.hideLoginModal();
            this.showAdminPanel();
            Utils.showNotification('Login realizado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Login failed:', error);
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
            // Check cache first
            const cachedProducts = localStorage.getItem('cachedProducts');
            const cacheTimestamp = localStorage.getItem('productsCacheTimestamp');
            const now = Date.now();
            
            // Use cache if it's less than 5 minutes old
            if (cachedProducts && cacheTimestamp && (now - parseInt(cacheTimestamp)) < 300000) {
                const products = JSON.parse(cachedProducts);
                STATE.products = products;
                this.renderProducts(products);
                return;
            }
            
            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.PRODUCTS}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const products = await response.json();
            
            if (!products || products.length === 0) {
                throw new Error('Nenhum produto encontrado no backend');
            }
            
            // Cache the products
            localStorage.setItem('cachedProducts', JSON.stringify(products));
            localStorage.setItem('productsCacheTimestamp', now.toString());
            
            STATE.products = products;
            this.renderProducts(products);
            Utils.showNotification(`${products.length} produtos carregados!`, 'success');
            
        } catch (error) {
            console.error('❌ Erro detalhado ao carregar produtos:', error);
            console.error('❌ Tipo do erro:', error.name);
            console.error('❌ Mensagem do erro:', error.message);
            
            // Try to use cached data if available, even if expired
            const cachedProducts = localStorage.getItem('cachedProducts');
            if (cachedProducts) {
                console.log('📦 Usando produtos do cache (expirado):', cachedProducts);
                const products = JSON.parse(cachedProducts);
                STATE.products = products;
                this.renderProducts(products);
                Utils.showNotification('Produtos carregados do cache (offline)', 'info');
                return;
            }
            
            if (error.name === 'AbortError') {
                Utils.showNotification('Timeout ao carregar produtos (3s)', 'error');
            } else {
                Utils.showNotification(`Erro ao carregar produtos: ${error.message}`, 'error');
            }
            
            // Show loading error state
            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Erro ao carregar produtos</h3>
                        <p>Não foi possível conectar com o backend.</p>
                        <p><strong>Erro:</strong> ${error.message}</p>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                            <button class="btn btn-primary" onclick="Products.loadProducts()">
                                <i class="fas fa-refresh"></i> Tentar Novamente
                            </button>
                            <button class="btn btn-secondary" onclick="Products.forceRefresh()">
                                <i class="fas fa-sync"></i> Forçar Atualização
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    },

    renderProducts(products) {
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) return;
        
        if (products.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">Nenhum produto encontrado no backend</p>';
            return;
        }
        
        const productsHTML = products.map(product => `
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
        
        productsGrid.innerHTML = productsHTML;
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
    },

    clearCache() {
        localStorage.removeItem('cachedProducts');
        localStorage.removeItem('productsCacheTimestamp');
        console.log('🗑️ Cache de produtos limpo');
    },

    forceRefresh() {
        this.clearCache();
        return this.loadProducts();
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
            console.log('🛒 Iniciando processamento do pedido...');
            console.log('🛒 Carrinho:', STATE.cart);
            
            // Primeiro, criar ou obter o cliente
            const clienteData = {
                nome: 'Cliente Padrão'
                // Removendo email e CPF para evitar problemas de validação
            };

            console.log('👤 Criando cliente:', clienteData);
            const cliente = await API.createCustomer(clienteData);
            console.log('✅ Cliente criado:', cliente);

            // Depois, criar o pedido
            const orderData = {
                cliente_id: cliente.id,
                itens: STATE.cart.map(item => ({
                    produto_id: item.id,
                    quantidade: item.quantity
                })),
                observacoes: 'Pedido realizado via sistema web'
            };

            console.log('📦 Criando pedido:', orderData);
            const order = await API.createOrder(orderData);
            console.log('✅ Pedido criado:', order);
            
            Cart.clear();
            CartSidebar.hide();
            
            Utils.showNotification('Pedido realizado com sucesso!', 'success');
            
            // Simulate order tracking
            this.showOrderConfirmation(order);
        } catch (error) {
            console.error('❌ Erro ao processar pedido:', error);
            console.error('❌ Stack trace:', error.stack);
            Utils.showNotification('Erro ao processar pedido: ' + error.message, 'error');
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
        // Force hide loading screen after 1 second regardless of what happens
        setTimeout(() => {
            this.hide();
        }, 1000);
    },

    show() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            loadingScreen.style.display = 'flex';
        }
    },

    hide() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Force hide with inline styles as backup
            loadingScreen.style.display = 'none';
        }
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen and force hide after 2 seconds
    LoadingScreen.show();
    LoadingScreen.init();
    
    // Initialize all modules
    try {
        Navigation.init();
        CartSidebar.init();
        AdminPanel.init();
        Forms.init();
        Cart.loadFromStorage();
    } catch (error) {
        console.error('Erro ao inicializar módulos:', error);
    }
    
    // Load products immediately (will use cache if available)
    Products.loadProducts().catch(error => {
        console.error('Erro ao carregar produtos:', error);
        Utils.showNotification('Erro ao carregar produtos do backend', 'error');
    });
});

// Fallback: Hide loading screen after 3 seconds maximum
setTimeout(() => {
    LoadingScreen.hide();
}, 3000);

// ===== GLOBAL FUNCTIONS =====
window.Cart = Cart;
window.Products = Products;
window.AdminPanel = AdminPanel;
window.Checkout = Checkout;
window.Utils = Utils;