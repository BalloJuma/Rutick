// API Configuration
const API_BASE_URL = (typeof window !== 'undefined' && window.API_URL) || 'http://localhost:5000/api';

// Utility functions for API calls
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = sessionStorage.getItem('authToken');

    const defaultHeaders = {
        'Content-Type': 'application/json'
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        const data = await response.json();

        console.log(`📥 API Response [${response.status}]:`, data);

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return { success: true, data };
    } catch (error) {
        console.error(`❌ API Error [${endpoint}]:`, error);
        return { success: false, error: error.message };
    }
};

// Get request
const apiGet = (endpoint) => apiCall(endpoint, { method: 'GET' });

// Post request
const apiPost = (endpoint, body) => apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body)
});

// Put request
const apiPut = (endpoint, body) => apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body)
});

// Delete request
const apiDelete = (endpoint) => apiCall(endpoint, { method: 'DELETE' });

// Auth API functions
const authAPI = {
    register: (firstName, lastName, email, studentId, department, password) =>
        apiPost('/auth/register', { firstName, lastName, email, studentId, department, password, confirmPassword: password }),

    login: (email, password) =>
        apiPost('/auth/login', { email, password }),

    getMe: () =>
        apiGet('/auth/me'),

    forgotPassword: (email) =>
        apiPost('/auth/forgot-password', { email }),

    resetPassword: (token, password) =>
        apiPost(`/auth/reset-password/${token}`, { password, confirmPassword: password }),

    logout: () =>
        apiPost('/auth/logout', {})
};

// Event API functions
const eventAPI = {
    getAll: (category = 'all', page = 1, limit = 20, search = '') =>
        apiGet(`/events?category=${category}&page=${page}&limit=${limit}&search=${search}`),

    getById: (id) =>
        apiGet(`/events/${id}`),

    create: (eventData) =>
        apiPost('/events', eventData),

    update: (id, eventData) =>
        apiPut(`/events/${id}`, eventData),

    delete: (id) =>
        apiDelete(`/events/${id}`),

    getMyEvents: () =>
        apiGet('/events/user/my-events')
};

// Registration API functions
const registrationAPI = {
    register: (eventId) =>
        apiPost(`/registrations/events/${eventId}/register`, {}),

    cancel: (eventId, reason = '') =>
        apiPost(`/registrations/events/${eventId}/unregister`, { reason }),

    getMyRegistration: (eventId) =>
        apiGet(`/registrations/events/${eventId}/registration`),

    getEventRegistrations: (eventId, page = 1) =>
        apiGet(`/registrations/events/${eventId}/registrations?page=${page}`),

    checkIn: (registrationId) =>
        apiPost(`/registrations/${registrationId}/check-in`, {})
};

// User API functions
const userAPI = {
    getProfile: (userId) =>
        apiGet(`/users/profile/${userId}`),

    updateProfile: (userData) =>
        apiPut('/users/profile', userData),

    changePassword: (currentPassword, newPassword) =>
        apiPost('/users/change-password', { currentPassword, newPassword, confirmPassword: newPassword }),

    getAttendance: (userId) =>
        apiGet(`/users/attendance/${userId}`),

    deactivateAccount: () =>
        apiDelete('/users/deactivate'),

    getDashboardStats: () =>
        apiGet('/users/dashboard/stats')
};

// Review API functions
const reviewAPI = {
    getEventReviews: (eventId, page = 1) =>
        apiGet(`/reviews/events/${eventId}/reviews?page=${page}`),

    create: (eventId, reviewData) =>
        apiPost(`/reviews/events/${eventId}/reviews`, reviewData),

    update: (reviewId, reviewData) =>
        apiPut(`/reviews/${reviewId}`, reviewData),

    delete: (reviewId) =>
        apiDelete(`/reviews/${reviewId}`),

    like: (reviewId) =>
        apiPost(`/reviews/${reviewId}/like`, {})
};

// Certificate API functions
const certificateAPI = {
    generate: (eventId) =>
        apiPost(`/certificates/events/${eventId}/certificates`, {}),

    getUserCertificates: (userId) =>
        apiGet(`/certificates/users/${userId}/certificates`),

    get: (certificateId) =>
        apiGet(`/certificates/${certificateId}`),

    getEventCertificates: (eventId) =>
        apiGet(`/certificates/events/${eventId}/certificates`),

    revoke: (certificateId) =>
        apiDelete(`/certificates/${certificateId}`)
};

// For browser use, attach APIs to window so modules are available to inline scripts
if (typeof window !== 'undefined') {
    window.apiCall = apiCall;
    window.apiGet = apiGet;
    window.apiPost = apiPost;
    window.apiPut = apiPut;
    window.apiDelete = apiDelete;
    window.authAPI = authAPI;
    window.eventAPI = eventAPI;
    window.registrationAPI = registrationAPI;
    window.userAPI = userAPI;
    window.reviewAPI = reviewAPI;
    window.certificateAPI = certificateAPI;
}

// For node/commonjs usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiCall,
        apiGet,
        apiPost,
        apiPut,
        apiDelete,
        authAPI,
        eventAPI,
        registrationAPI,
        userAPI,
        reviewAPI,
        certificateAPI
    };
}
