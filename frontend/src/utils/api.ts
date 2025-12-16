// Shared API utility functions

export const API_BASE = 'http://localhost:8080';

export async function apiCall(endpoint: string, options: RequestInit = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: 'include', // Include cookies (JWT)
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        
        const data = await response.json();
        return { ok: response.ok, status: response.status, data };
    } catch (error) {
        console.error('API call failed:', error);
        return { ok: false, status: 0, data: { success: false, error: 'Network error' } };
    }
}
