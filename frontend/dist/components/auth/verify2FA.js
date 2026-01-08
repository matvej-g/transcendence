// Verify 2FA Code Logic
import { apiCall } from '../../utils/api.js';
function showError(message) {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    if (errorEl && successEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        successEl.classList.add('hidden');
    }
}
function showSuccess(message) {
    const errorEl = document.getElementById('error-message');
    const successEl = document.getElementById('success-message');
    if (errorEl && successEl) {
        successEl.textContent = message;
        successEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
    }
}
async function verifyCode(code) {
    const result = await apiCall('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
    if (result.ok && result.data.success) {
        showSuccess('✅ Verification successful! Redirecting...');
        setTimeout(() => {
            window.location.href = '/userLanding.html';
        }, 1500);
    }
    else {
        showError(result.data.error || 'Invalid or expired code');
    }
}
async function resendCode() {
    const result = await apiCall('/api/auth/send-2fa', {
        method: 'POST',
    });
    if (result.ok && result.data.success) {
        showSuccess('✅ New code sent to your email');
    }
    else {
        showError(result.data.error || 'Failed to resend code');
    }
}
// Initialize form handling
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('verify-2fa-form');
    const codeInput = document.getElementById('code');
    const resendBtn = document.getElementById('resendBtn');
    if (form && codeInput) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = codeInput.value.trim();
            if (code.length !== 6 || !/^\d{6}$/.test(code)) {
                showError('Please enter a valid 6-digit code');
                return;
            }
            await verifyCode(code);
        });
        // Auto-format input (only digits)
        codeInput.addEventListener('input', (e) => {
            const target = e.target;
            target.value = target.value.replace(/\D/g, '').slice(0, 6);
        });
    }
    if (resendBtn) {
        resendBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await resendCode();
        });
    }
});
