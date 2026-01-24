// verifyRegistration.ts - handles registration code verification
import { t } from '../languages/i18n.js';

function getEmailFromHash(): string | null {
    if (window.location.hash.includes('?')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        return hashParams.get('email');
    }
    return null;
}

async function resendRegistrationCode(resendBtn: HTMLButtonElement, messageDiv: HTMLDivElement, email: string) {
    if (resendBtn.disabled) return;

    resendBtn.disabled = true;
    const originalText = resendBtn.textContent;
    resendBtn.textContent = t('authMsg.resendingSending');

    try {
        const response = await fetch('/api/user/resend-registration-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            messageDiv.innerHTML = `<div class="text-green-600 mb-2">${t('authMsg.resendSuccess')}</div>`;
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
            messageDiv.innerHTML = `<div class="text-red-600 mb-2">${data.error || t('authMsg.resendFailed')}</div>`;
            resendBtn.disabled = false;
            resendBtn.textContent = originalText;
        }
    } catch (error) {
        messageDiv.innerHTML = `<div class="text-red-600 mb-2">${t('authMsg.networkErrorGeneric')}</div>`;
        resendBtn.disabled = false;
        resendBtn.textContent = originalText;
    }
}

function initVerifyRegistrationSection() {
    const codeInput = document.getElementById('codeInput') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const resendBtn = document.getElementById('resend-registration-btn') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    // Remove previous listeners to avoid duplicates
    verifyBtn?.replaceWith(verifyBtn.cloneNode(true));
    resendBtn?.replaceWith(resendBtn.cloneNode(true));
    // Re-select after replace
    const newVerifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const newResendBtn = document.getElementById('resend-registration-btn') as HTMLButtonElement;

    // Get email from hash params (e.g. #verify-registration?email=foo@bar.com)
    const email = getEmailFromHash();

    if (!email) {
        messageDiv.innerHTML = `<div class="text-red-600 mb-2">${t('authMsg.verifyRegNoEmail')}</div>`;
        newVerifyBtn.disabled = true;
        if (newResendBtn) newResendBtn.disabled = true;
    } else {
        newVerifyBtn.disabled = false;
        if (newResendBtn) newResendBtn.disabled = false;
    }

    newVerifyBtn.addEventListener('click', async () => {
        const code = codeInput.value.trim();
        if (code.length !== 6) {
            messageDiv.innerHTML = `<div class="text-red-600 mb-2">${t('authMsg.verifyRegEnterCode')}</div>`;
            return;
        }
        newVerifyBtn.disabled = true;
        newVerifyBtn.textContent = t('authMsg.verifyRegVerifying');
        messageDiv.innerHTML = '';
        try {
            const response = await fetch('/api/user/verify-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                messageDiv.innerHTML = `<div class="text-green-600 mb-2">${t('authMsg.verifyRegSuccess')}</div>`;
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } else {
                messageDiv.innerHTML = `<div class="text-red-600 mb-2">${data.error || t('authMsg.verifyRegFailed')}</div>`;
                newVerifyBtn.disabled = false;
                newVerifyBtn.textContent = t('authDom.verifyBtn');
            }
        } catch (error) {
            messageDiv.innerHTML = `<div class="text-red-600 mb-2">${t('authMsg.networkErrorGeneric')}</div>`;
            newVerifyBtn.disabled = false;
            newVerifyBtn.textContent = t('authDom.verifyBtn');
        }
    });

    // Resend button handler
    if (newResendBtn && email) {
        newResendBtn.addEventListener('click', () => resendRegistrationCode(newResendBtn, messageDiv, email));
    }

    // Allow Enter key to submit
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            newVerifyBtn.click();
        }
    });
}

// Run on initial load if section is visible
if (document.getElementById('verify-registration-section')?.classList.contains('hidden') === false) {
    initVerifyRegistrationSection();
}

// Listen for hashchange and re-init if section is shown
window.addEventListener('hashchange', () => {
    const section = window.location.hash.split('?')[0].replace('#', '');
    if (section === 'verify-registration') {
        setTimeout(() => {
            initVerifyRegistrationSection();
        }, 0);
    }
});
