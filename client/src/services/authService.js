<!-- import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const authService = {
    getCurrentUser: async () => {
        const response = await api.get('/auth/current-user');
        return unwrap(response);
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return unwrap(response);
    },
    googleLogin: () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    }
};

export default authService;

 -->


import api from './api';

const unwrap = (response) => response?.data?.data ?? response?.data;

const authService = {
    getCurrentUser: async () => {
        const response = await api.get('/auth/current-user');
        return unwrap(response);
    },
    logout: async () => {
        const response = await api.post('/auth/logout');
        return unwrap(response);
    },
    googleLogin: () => {
        window.location.href = 'https://kingohub.onrender.com/api/auth/google';
    }
};

export default authService;


