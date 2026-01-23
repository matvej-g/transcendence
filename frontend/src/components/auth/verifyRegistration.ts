// verifyRegistration.ts - handles registration code verification
import { t } from '../languages/i18n.js';

function initVerifyRegistrationSection() {
    const codeInput = document.getElementById('codeInput') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    // Remove previous listeners to avoid duplicates
    verifyBtn?.replaceWith(verifyBtn.cloneNode(true));
    // Re-select after replace
    const newVerifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;

    // Get email from hash params (e.g. #verify-registration?email=foo@bar.com)
    let email = null;
    if (window.location.hash.includes('?')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        email = hashParams.get('email');
    }

    if (!email) {
        messageDiv.innerHTML = `<div class="text-red-600 mb-2">${t('authMsg.verifyRegNoEmail')}</div>`;
        newVerifyBtn.disabled = true;
    } else {
        newVerifyBtn.disabled = false;
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
