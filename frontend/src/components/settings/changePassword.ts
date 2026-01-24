import { logger } from '../../utils/logger.js';

// Utility to sanitize strings (defense-in-depth)
function sanitizeString(str: string): string {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}
import { changePassword } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';
import { t } from '../languages/i18n.js';

const changePasswordModal = document.getElementById('settings-change-password');
const changePasswordForm = document.getElementById('change-password-form') as HTMLFormElement | null;
const oldPasswordInput = document.getElementById('old-password') as HTMLInputElement | null;
const newPasswordInput = document.getElementById('new-password') as HTMLInputElement | null;
const changePasswordError = document.getElementById('change-password-error');
const cancelChangePasswordBtn = document.getElementById('cancel-change-password');

// Check if user is Google OAuth user
window.addEventListener('hashchange', async () => {
  if (window.location.hash === '#settings/change-password') {
    const userId = getCurrentUserId();
    if (userId) {
      try {
        const res = await fetch(`/api/user/${userId}`, { credentials: 'include' });
        const userData = await res.json();
        const user = userData?.user || userData;
        
        if (user?.oauth_id) {
          // User is logged in with Google - show warning and disable form
          if (changePasswordError) {
            changePasswordError.innerHTML = `
              ⚠️ <strong>${t('settings.googleCannotChangePassword')}</strong><br>
              ${t('settings.googlePasswordManaged')}<br><br>
              <button onclick="window.location.hash='#profile'"
                      style="background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold;">
                ← ${t('settings.backToProfile')}
              </button>
            `;
            changePasswordError.style.color = '#f59e0b';
            changePasswordError.style.marginBottom = '16px';
          }
          // Disable form inputs
          if (oldPasswordInput) {
            oldPasswordInput.disabled = true;
            oldPasswordInput.style.opacity = '0.5';
            oldPasswordInput.style.cursor = 'not-allowed';
          }
          if (newPasswordInput) {
            newPasswordInput.disabled = true;
            newPasswordInput.style.opacity = '0.5';
            newPasswordInput.style.cursor = 'not-allowed';
          }
          // Disable submit button
          const submitBtn = changePasswordForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
          }
        } else {
          // Regular user - enable everything
          if (changePasswordError) {
            changePasswordError.textContent = '';
            changePasswordError.style.marginBottom = '';
          }
          if (oldPasswordInput) {
            oldPasswordInput.disabled = false;
            oldPasswordInput.style.opacity = '1';
            oldPasswordInput.style.cursor = 'text';
          }
          if (newPasswordInput) {
            newPasswordInput.disabled = false;
            newPasswordInput.style.opacity = '1';
            newPasswordInput.style.cursor = 'text';
          }
          const submitBtn = changePasswordForm?.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
          }
        }
      } catch (err) {
        logger.error('Failed to check OAuth status:', err);
      }
    }
  }
});

if (cancelChangePasswordBtn && changePasswordModal) {
  cancelChangePasswordBtn.addEventListener('click', () => {
    window.location.hash = '#profile';
  });
}

if (changePasswordForm) {
  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!oldPasswordInput || !newPasswordInput) return;
    const oldPassword = oldPasswordInput.value;
    const newPassword = newPasswordInput.value;
    if (!oldPassword || !newPassword) {
      if (changePasswordError) changePasswordError.textContent = 'Please fill in both fields.';
      return;
    }
    const userId = getCurrentUserId();
    if (!userId) {
      if (changePasswordError) changePasswordError.textContent = 'User not found.';
      return;
    }
    try {
      if (changePasswordError) changePasswordError.textContent = '';
      const result = await changePassword({ id: userId, oldPassword, newPassword });
      if (result && result.message) {
		alert("OK: Changed password.");
        window.location.hash = '#profile';
      } else {
        if (changePasswordError) changePasswordError.textContent = sanitizeString(result?.error || 'Change failed.');
      }
    } catch (err: any) {
      if (changePasswordError) changePasswordError.textContent = sanitizeString(err?.message || 'Change failed.');
    }
  });
}
