const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && window.location.port === '5173') {
        return 'http://localhost:8000/api';
    }
    return '/api';
};

const BASE_URL = getBaseUrl();

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = {
        ...options.headers,
    };

    // Omit 'Content-Type' for FormData to allow fetch to set the boundary correctly
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }

    // TODO(security): Storing tokens in localStorage is vulnerable to XSS.
    // For a production-ready application, use secure HttpOnly cookies instead.
    const token = localStorage.getItem('ravedex_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP! Código: ${response.status}`);
    }
    
    if (response.status === 204) {
        return null;
    }
    
    return response.json();
}

export const api = {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, {
        ...options,
        method: 'POST',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    put: (path, body, options) => request(path, {
        ...options,
        method: 'PUT',
        body: body instanceof FormData ? body : JSON.stringify(body)
    }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
