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
            window.location.href = '/index.html?t=' + Date.now() + '#profile';
        }, 1500);
    } else {
        showMessage(result.data.error || t('authMsg.verify2faInvalidCode'), true);
    }
}

async function resend2FACode(resendBtn: HTMLButtonElement) {
    if (resendBtn.disabled) return;

    resendBtn.disabled = true;
    const originalText = resendBtn.textContent;
    resendBtn.textContent = t('authMsg.resendingSending');

    try {
        const result = await apiCall('/api/auth/send-2fa', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        if (result.ok && result.data.success) {
            showMessage(t('authMsg.resendSuccess'), false);
            // Keep button disabled for 30 seconds to prevent spam
            let countdown = 30;
            const interval = setInterval(() => {
                resendBtn.textContent = `${t('authMsg.resendWait')} (${countdown}s)`;
                countdown--;
                if (countdown < 0) {
                    clearInterval(interval);
                    resendBtn.disabled = false;
                    resendBtn.textContent = originalText;
                }
            }, 1000);
        } else {
            showMessage(result.data.error || t('authMsg.resendFailed'), true);
            resendBtn.disabled = false;
            resendBtn.textContent = originalText;
        }
    } catch (error) {
        showMessage(t('authMsg.networkErrorGeneric'), true);
        resendBtn.disabled = false;
        resendBtn.textContent = originalText;
    }
}

// Initialize form handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-2fa-form') as HTMLFormElement;
    const codeInput = document.getElementById('code') as HTMLInputElement;
    const resendBtn = document.getElementById('resend-2fa-btn') as HTMLButtonElement;

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

    if (resendBtn) {
        resendBtn.addEventListener('click', () => resend2FACode(resendBtn));
    }
});
