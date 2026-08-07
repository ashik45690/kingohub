import axios from 'axios';

<!-- const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
});

// Add a request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api; -->


import axios from 'axios';

const api = axios.create({
    baseURL: 'https://kingohub.onrender.com/api',
    withCredentials: true
});

// Add a request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
