// User Landing Page - Protected by JWT + 2FA
import { apiCall } from '../../utils/api.js';
import { logger } from '../../utils/logger.js';

interface User {
    id: number;
    username: string;
    email?: string;
}

async function checkAuthAndLoad2FA() {
    // Try to fetch current user data - this requires JWT with 2FA verified
    const result = await apiCall('/api/users', {
        method: 'GET',
    });

    if (!result.ok) {
        // Not authenticated or 2FA not verified
        logger.log('Auth check failed:', result.data);
        
        // Check if it's specifically a 2FA issue
        if (result.data?.error?.includes('2FA')) {
            // Show custom dialog with ignore button
            return await show2FADialog();
        }
        
        // Not authenticated at all - redirect to login
        alert('You must login to access this page');
        window.location.href = '/index.html';
        return null;
    }

    // Successfully authenticated with 2FA
    return result.data;
}

async function show2FADialog(): Promise<any> {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:white;padding:24px;border-radius:12px;max-width:400px;box-shadow:0 4px 6px rgba(0,0,0,0.1)';
        dialog.innerHTML = `
            <h2 style="margin:0 0 12px 0;font-size:20px;font-weight:600">2FA Verification Required</h2>
            <p style="margin:0 0 20px 0;color:#666;line-height:1.5">
                Two-factor authentication is required to access all features. 
                You can verify now or continue with limited access.
            </p>
            <div style="display:flex;gap:12px">
                <button id="verify2FABtn" style="flex:1;padding:10px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">
                    Verify 2FA
                </button>
                <button id="ignoreBtn" style="flex:1;padding:10px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;cursor:pointer;font-weight:500">
                    Ignore
                </button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Handle buttons
        document.getElementById('verify2FABtn')?.addEventListener('click', () => {
            document.body.removeChild(overlay);
            window.location.hash = '#verify-2fa';
            resolve(null);
        });
        
        document.getElementById('ignoreBtn')?.addEventListener('click', () => {
            document.body.removeChild(overlay);
            logger.log('User chose to bypass 2FA check');
            resolve({ limited: true });
        });
    });
}

async function loadUserProfile() {
    // This would be a specific endpoint to get current user's profile
    // For now, we'll just verify we can access protected routes
    const result = await apiCall('/api/users', {
        method: 'GET',
    });

    if (result.ok && result.data.length > 0) {
        // Display first user as example (in real app, would be current user)
        const user = result.data[0];
        const userMetaEl = document.getElementById('userMeta');
        if (userMetaEl) {
            userMetaEl.textContent = `Logged in as: ${user.username || 'User'}`;
        }
    }
}

function setupButtons() {
    // Placeholder button handlers
    const btn1v1 = document.getElementById('btn1v1');
    const btn1vPC = document.getElementById('btn1vPC');
    const btnTournament = document.getElementById('btnTournament');
    const btnProfile = document.getElementById('btnProfile');
    const btnMessages = document.getElementById('btnMessages');

    if (btn1v1) {
        btn1v1.addEventListener('click', () => {
            alert('1v1 Mode - Coming soon!');
        });
    }

    if (btn1vPC) {
        btn1vPC.addEventListener('click', () => {
            alert('1vPC Mode - Coming soon!');
        });
    }

    if (btnTournament) {
        btnTournament.addEventListener('click', async () => {
            // Test: Fetch tournaments (protected route)
            const result = await apiCall('/api/tournaments', { method: 'GET' });
            if (result.ok) {
                alert(`Tournaments loaded: ${JSON.stringify(result.data)}`);
            } else {
                alert(`Error: ${result.data.error}`);
            }
        });
    }

    if (btnProfile) {
        btnProfile.addEventListener('click', async () => {
            // Test: Fetch users (protected route)
            const result = await apiCall('/api/users', { method: 'GET' });
            if (result.ok) {
                alert(`Users: ${JSON.stringify(result.data)}`);
            } else {
                alert(`Error: ${result.data.error}`);
            }
        });
    }

    if (btnMessages) {
        btnMessages.addEventListener('click', () => {
            alert('Messages - Coming soon!');
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication with 2FA
    const authData = await checkAuthAndLoad2FA();
    
    if (authData) {
        // User is authenticated with 2FA verified
        logger.log('✓ User authenticated with 2FA');
        
        // Load user profile
        await loadUserProfile();
        
        // Setup button handlers
        setupButtons();
    }
});

// Export for potential use elsewhere
export { checkAuthAndLoad2FA };
