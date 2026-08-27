import axios from 'axios';
import Cookies from 'js-cookie';

// Single source of truth for the backend origin — every request goes through
// here so there's one place to get the base URL right, instead of each
// component concatenating VITE_API_URL by hand.
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
});

// Attach the auth token automatically when one exists, so call sites don't
// each need their own `{ headers: { Authorization: ... } }` boilerplate.
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
