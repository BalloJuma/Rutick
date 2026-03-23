/**
 * Authentication Module
 * Handles user login, registration, logout, and authentication state
 */

let currentUser = null;

// Validate login form inputs
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errors = {};

    if (!email) {
        errors.email = 'Email is required';
    } else if (!email.endsWith('@riarauniversity.ac.ke')) {
        errors.email = 'Please use your university email';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}

// Secure login with API structure (ready for backend)
async function login() {
    const validation = validateLoginForm();

    if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => {
            showNotification('Validation Error', error, 'error');
        });
        return;
    }

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
        console.log('🔐 Attempting login for:', email);
        const result = await authAPI.login(email, password);
        console.log('🔐 Login result:', result);

        if (result.success) {
            currentUser = result.data.user;
            sessionStorage.setItem('authToken', result.data.token);
            showDashboard();
            showNotification('Login Successful', `Welcome back, ${currentUser.firstName}!`);
        } else {
            showNotification('Login Failed', result.error || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Error', 'Login failed. Please try again.', 'error');
    }
}

// Simulate login for development (remove in production)
function simulateLogin(email) {
    // Determine role based on email
    let role = 'student';
    if (email.includes('admin@')) {
        role = 'admin';
    } else if (email.includes('staff@')) {
        role = 'staff';
    }

    // Mock user data for UI testing only
    const mockUser = {
        email: email,
        firstName: email.split('@')[0].split('.')[0] || 'User',
        lastName: email.split('@')[0].split('.')[1] || 'Test',
        role: role,  // Now uses detected role from email
        id: 'RU' + Math.random().toString(36).substr(2, 7),
        department: 'Computer Science'
    };

    currentUser = mockUser;
    // Store only token, never credentials
    const token = generateMockToken();
    sessionStorage.setItem('authToken', token);

    showDashboard();
    showNotification('Login Successful', `Welcome back as ${role.toUpperCase()}!`);
}

// Validate registration form inputs
function validateRegistrationForm() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const id = document.getElementById('regId').value.trim();
    const department = document.getElementById('regDepartment').value;
    const password = document.getElementById('regPassword').value;
    const errors = {};

    if (!firstName || firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
    }

    if (!lastName || lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!email || !email.endsWith('@riarauniversity.ac.ke')) {
        errors.email = 'Please use a valid university email (name@riarauniversity.ac.ke)';
    }

    if (!id || id.length < 5) {
        errors.id = 'Invalid student/staff ID';
    }

    if (!department) {
        errors.department = 'Please select a department';
    }

    if (!password || password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter';
    }

    if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
}

// Secure registration with API structure
async function register() {
    const validation = validateRegistrationForm();

    if (!validation.isValid) {
        Object.values(validation.errors).forEach(error => {
            showNotification('Validation Error', error, 'error');
        });
        return;
    }

    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const id = document.getElementById('regId').value.trim();
    const department = document.getElementById('regDepartment').value;
    const password = document.getElementById('regPassword').value;

    try {
        console.log('📝 Attempting registration for:', email);
        const result = await authAPI.register(firstName, lastName, email, id, department, password);
        console.log('📝 Registration result:', result);

        if (result.success) {
            currentUser = result.data.user;
            sessionStorage.setItem('authToken', result.data.token);
            showDashboard();
            showNotification('Registration Successful', `Welcome to Tanga Tunga, ${firstName}!`);
        } else {
            showNotification('Registration Failed', result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Error', 'Registration failed. Please try again.', 'error');
    }
}

// Simulate registration for development (remove in production)
function simulateRegister(firstName, lastName, email, id, department) {
    const newUser = { firstName, lastName, email, id, department, role: 'student' };
    currentUser = newUser;
    const token = generateMockToken();
    sessionStorage.setItem('authToken', token);

    showDashboard();
    showNotification('Registration Successful', `Welcome to Tanga Tunga, ${firstName}!`);
}

// Generate mock token for development (replace with real JWT in production)
function generateMockToken() {
    return 'Bearer_' + btoa(JSON.stringify({ exp: Date.now() + 3600000 }));
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');

    // In production: Call backend logout endpoint
    // fetch(`${API_BASE}/api/auth/logout`, {
    //     method: 'POST',
    //     credentials: 'include'
    // }).catch(error => console.error('Logout error:', error));

    goToHome();
    showNotification('Logged Out', 'You have been successfully logged out');
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null && sessionStorage.getItem('authToken') !== null;
}

// Switch between login and registration tabs
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    if (tab === 'login') {
        document.querySelector('.tab:first-child').classList.add('active');
        document.getElementById('loginTab').classList.add('active');
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        document.getElementById('registerTab').classList.add('active');
    }
}
