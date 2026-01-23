// Verify 2FA Code Logic
import { apiCall } from '../../utils/api.js';
import { appWs } from '../../ws/appWs.js';
import { t } from '../languages/i18n.js';

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
        showMessage(t('authMsg.verify2faSuccess'), false);
        setTimeout(() => {
            window.location.href = '/index.html#profile';
			appWs.connect(); //connect app websocket after login
        }, 1500);
    } else {
        showMessage(result.data.error || t('authMsg.verify2faInvalidCode'), true);
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
                showMessage(t('authMsg.verify2faEnterCode'), true);
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
