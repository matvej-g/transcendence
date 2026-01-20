// verifyRegistration.ts - handles registration code verification


function initVerifyRegistrationSection() {
    const codeInput = document.getElementById('codeInput') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const bypassBtn = document.getElementById('bypassBtn') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    // Remove previous listeners to avoid duplicates
    verifyBtn?.replaceWith(verifyBtn.cloneNode(true));
    bypassBtn?.replaceWith(bypassBtn.cloneNode(true));
    // Re-select after replace
    const newVerifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const newBypassBtn = document.getElementById('bypassBtn') as HTMLButtonElement;

    // Get email from hash params (e.g. #verify-registration?email=foo@bar.com)
    let email = null;
    if (window.location.hash.includes('?')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        email = hashParams.get('email');
    }

    if (!email) {
        messageDiv.innerHTML = '<div class="text-red-600 mb-2">No email found. Please register again.</div>';
        newVerifyBtn.disabled = true;
        newBypassBtn.disabled = true;
    } else {
        newVerifyBtn.disabled = false;
        newBypassBtn.disabled = false;
    }

    // Bypass button - uses special bypass code
    newBypassBtn.addEventListener('click', async () => {
        newBypassBtn.disabled = true;
        newBypassBtn.textContent = 'Creating account...';
        messageDiv.innerHTML = '<div class="text-green-600 mb-2">DEV MODE: Bypassing verification...</div>';

        try {
            await fetch('/api/user/verify-registration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    code: 'BYPASS123',  // Special bypass code
                    bypass: true         // Bypass flag
                })
            });
            // Redirect to login regardless of response (for dev mode)
            messageDiv.innerHTML = '<div class="text-green-600 mb-2">Account created! Redirecting to login...</div>';
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        } catch (error) {
            messageDiv.innerHTML = '<div class="text-green-600 mb-2">Redirecting to login...</div>';
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);
        }
    });

    newVerifyBtn.addEventListener('click', async () => {
        const code = codeInput.value.trim();
        if (code.length !== 6) {
            messageDiv.innerHTML = '<div class="text-red-600 mb-2">Please enter a 6-digit code</div>';
            return;
        }
        newVerifyBtn.disabled = true;
        newVerifyBtn.textContent = 'Verifying...';
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
                messageDiv.innerHTML = '<div class="text-green-600 mb-2">Account created successfully! Redirecting to login...</div>';
                setTimeout(() => {
                    window.location.href = '/index.html';
                }, 2000);
            } else {
                messageDiv.innerHTML = `<div class="text-red-600 mb-2">${data.error || 'Verification failed'}</div>`;
                newVerifyBtn.disabled = false;
                newVerifyBtn.textContent = 'Verify & Create Account';
            }
        } catch (error) {
            messageDiv.innerHTML = '<div class="text-red-600 mb-2">Network error. Please try again.</div>';
            newVerifyBtn.disabled = false;
            newVerifyBtn.textContent = 'Verify & Create Account';
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
