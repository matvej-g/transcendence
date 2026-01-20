// verifyRegistration.ts - handles registration code verification

document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput') as HTMLInputElement;
    const verifyBtn = document.getElementById('verifyBtn') as HTMLButtonElement;
    const bypassBtn = document.getElementById('bypassBtn') as HTMLButtonElement;
    const messageDiv = document.getElementById('message') as HTMLDivElement;

    // Get email from URL params
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (!email) {
        messageDiv.innerHTML = '<div class="text-red-600 mb-2">No email found. Please register again.</div>';
        verifyBtn.disabled = true;
        bypassBtn.disabled = true;
    }

    // Bypass button - uses special bypass code
    bypassBtn.addEventListener('click', async () => {
        bypassBtn.disabled = true;
        bypassBtn.textContent = 'Creating account...';
        messageDiv.innerHTML = '<div class="text-green-600 mb-2">DEV MODE: Bypassing verification...</div>';

        try {
            const response = await fetch('/api/user/verify-registration', {
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

    verifyBtn.addEventListener('click', async () => {
        const code = codeInput.value.trim();
        if (code.length !== 6) {
            messageDiv.innerHTML = '<div class="text-red-600 mb-2">Please enter a 6-digit code</div>';
            return;
        }
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';
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
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify & Create Account';
            }
        } catch (error) {
            messageDiv.innerHTML = '<div class="text-red-600 mb-2">Network error. Please try again.</div>';
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify & Create Account';
        }
    });

    // Allow Enter key to submit
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            verifyBtn.click();
        }
    });
});
