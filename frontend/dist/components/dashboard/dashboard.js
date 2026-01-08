// Dashboard Logic
import { apiCall } from '../../utils/api.js';
async function checkAuth() {
    // Verify JWT token and 2FA status
    const result = await apiCall('/api/auth/verify', {
        method: 'GET',
    });
    if (!result.ok) {
        // Not authenticated, redirect to login
        window.location.href = '/index.html';
    }
}
async function logout() {
    // Clear JWT cookie and redirect
    document.cookie = 'jwt_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/index.html';
}
async function loadUserInfo() {
    // In the future, load actual user data from API
    const userIdEl = document.getElementById('userId');
    if (userIdEl) {
        userIdEl.textContent = 'Authenticated User';
    }
}
// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication on load
    checkAuth();
    // Load user information
    loadUserInfo();
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    // Quick action cards (placeholder for now)
    const cards = document.querySelectorAll('.cursor-pointer');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3')?.textContent;
            alert(`${title} - Coming soon!`);
        });
    });
});
