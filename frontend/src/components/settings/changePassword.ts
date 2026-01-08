import { changePassword } from './api.js';
import { getCurrentUserId } from '../auth/authUtils.js';

const changePasswordModal = document.getElementById('settings-change-password');
const changePasswordForm = document.getElementById('change-password-form') as HTMLFormElement | null;
const oldPasswordInput = document.getElementById('old-password') as HTMLInputElement | null;
const newPasswordInput = document.getElementById('new-password') as HTMLInputElement | null;
const changePasswordError = document.getElementById('change-password-error');
const cancelChangePasswordBtn = document.getElementById('cancel-change-password');

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
        if (changePasswordError) changePasswordError.textContent = result?.error || 'Change failed.';
      }
    } catch (err: any) {
      if (changePasswordError) changePasswordError.textContent = err?.message || 'Change failed.';
    }
  });
}
