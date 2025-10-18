// Admin Authentication System
class AdminAuth {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }
    
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Basic validation
        if (!username || !password) {
            this.showAlert('Please fill in all fields', 'danger');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call (replace with actual authentication)
            const response = await this.authenticateUser(username, password);
            
            if (response.success) {
                // Store authentication data
                const authData = {
                    token: response.token,
                    user: response.user,
                    timestamp: Date.now()
                };
                
                if (rememberMe) {
                    localStorage.setItem('adminAuth', JSON.stringify(authData));
                } else {
                    sessionStorage.setItem('adminAuth', JSON.stringify(authData));
                }
                
                this.showAlert('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                
            } else {
                this.showAlert(response.message || 'Invalid credentials', 'danger');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showAlert('Login failed. Please try again.', 'danger');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async authenticateUser(username, password) {
        // Simulate API call - replace with actual backend authentication
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo credentials (replace with actual authentication)
                if (username === 'admin' && password === 'xharlez2024') {
                    resolve({
                        success: true,
                        token: 'demo-jwt-token-' + Date.now(),
                        user: {
                            id: 1,
                            username: 'admin',
                            name: 'Administrator',
                            role: 'super_admin'
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid username or password'
                    });
                }
            }, 1000);
        });
    }
    
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        const icon = toggleBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
    
    checkAuthStatus() {
        const authData = this.getAuthData();
        
        // If on login page and already authenticated, redirect to dashboard
        if (window.location.pathname.includes('login.html') && authData) {
            window.location.href = 'dashboard.html';
            return;
        }
        
        // If on protected page and not authenticated, redirect to login
        if (!window.location.pathname.includes('login.html') && !authData) {
            window.location.href = 'login.html';
            return;
        }
    }
    
    getAuthData() {
        const sessionAuth = sessionStorage.getItem('adminAuth');
        const localAuth = localStorage.getItem('adminAuth');
        
        const authData = sessionAuth ? JSON.parse(sessionAuth) : 
                        localAuth ? JSON.parse(localAuth) : null;
        
        // Check if token is expired (24 hours)
        if (authData && (Date.now() - authData.timestamp > 24 * 60 * 60 * 1000)) {
            this.logout();
            return null;
        }
        
        return authData;
    }
    
    logout() {
        sessionStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuth');
        window.location.href = 'login.html';
    }
    
    showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create new alert
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert alert
        const container = document.querySelector('.login-form-container') || document.querySelector('.content-area');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});

// Global logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        const auth = new AdminAuth();
        auth.logout();
    }
}