const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    const response = await fetch(url, {
        ...options,
        headers,
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro HTTP! Código: ${response.status}`);
    }
    
    return response.json();
}

export const api = {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
