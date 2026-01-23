// Verify 2FA Code Logic
import { apiCall } from '../../utils/api.js';
import { appWs } from '../../ws/appWs.js';

function showMessage(message: string, isError: boolean) {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    
    if (isError && errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        if (successEl) successEl.style.display = 'none';
    } else if (!isError && successEl) {
        successEl.textContent = message;
        successEl.style.display = 'block';
        if (errorEl) errorEl.style.display = 'none';
    }
}

async function verifyCode(code: string) {
    const result = await apiCall('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });

    if (result.ok && result.data.success) {
        showMessage('Verification successful! Redirecting...', false);
        setTimeout(() => {
            window.location.href = '/index.html?t=' + Date.now() + '#profile';
			appWs.connect(); //connect app websocket after login
        }, 1500);
    } else {
        showMessage(result.data.error || 'Invalid or expired code', true);
    }
}

// Initialize form handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-2fa-form') as HTMLFormElement;
    const codeInput = document.getElementById('code') as HTMLInputElement;

    if (form && codeInput) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = codeInput.value.trim();

            if (code.length !== 6 || !/^\d{6}$/.test(code)) {
                showMessage('Please enter a valid 6-digit code', true);
                return;
            }

            await verifyCode(code);
        });

        // Only allow digits
        codeInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            target.value = target.value.replace(/\D/g, '').slice(0, 6);
        });
    }
});
