import { getCurrentUserId } from '../auth/authUtils.js';
import { logger } from '../../utils/logger.js';

const toggleBtn = document.getElementById('dropdown-toggle-2fa');
const methodSelector = document.getElementById('2fa-method-selector');
const methodEmailBtn = document.getElementById('2fa-method-email');
const methodSmsBtn = document.getElementById('2fa-method-sms');

// Phone number modal elements
const phoneModal = document.getElementById('settings-phone-number');
const phoneForm = document.getElementById('phone-number-form') as HTMLFormElement | null;
const phoneInput = document.getElementById('2fa-phone-number') as HTMLInputElement | null;
const phoneCancelBtn = document.getElementById('cancel-phone-number');
const phoneError = document.getElementById('2fa-phone-error');

// Track current 2FA state
let currentlyEnabled = false;
let currentMethod = 'email';
let isOAuthUser = false;

// Fetch current 2FA status on page load
async function load2FAStatus() {
  try {
    const userId = getCurrentUserId();

    if (!userId) {
      return;
    }

    if (userId) {
      const userRes = await fetch(`/api/user/${userId}`, { credentials: 'include' });
      const userData = await userRes.json();
      const user = userData?.user || userData;
      isOAuthUser = !!user?.oauth_id;
    }

    const response = await fetch('/api/auth/2fa/status', {
      method: 'GET',
      credentials: 'include'
    });

    if (response.status === 401) {
      return;
    }

    const data = await response.json();

    if (data.success && toggleBtn) {
      const enabled = data.two_factor_enabled;
      currentlyEnabled = enabled;
      updateToggleUI(enabled);
    }

    // Load 2FA method + phone number
    const methodRes = await fetch('/api/auth/2fa/method', {
      method: 'GET',
      credentials: 'include'
    });
    if (methodRes.ok) {
      const methodData = await methodRes.json();
      if (methodData.success) {
        currentMethod = methodData.two_factor_method || 'email';
        updateMethodUI(currentMethod);

        // Store phone number for pre-filling the modal
        if (methodData.phone_number && phoneInput) {
          phoneInput.value = methodData.phone_number;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load 2FA status:', error);
  }
}

// Update toggle button UI
function updateToggleUI(enabled: boolean) {
  if (!toggleBtn) return;

  if (enabled) {
    toggleBtn.classList.remove('bg-gray-400');
    toggleBtn.classList.add('bg-emerald-400');
    (toggleBtn.querySelector('span.inline-block') as HTMLElement).style.transform = 'translateX(24px)';
  } else {
    toggleBtn.classList.remove('bg-emerald-400');
    toggleBtn.classList.add('bg-gray-400');
    (toggleBtn.querySelector('span.inline-block') as HTMLElement).style.transform = 'translateX(0)';
  }

  // Show/hide method selector based on 2FA enabled state
  if (methodSelector) {
    if (enabled) {
      methodSelector.classList.remove('hidden');
    } else {
      methodSelector.classList.add('hidden');
    }
  }
}

// Update method selector button styles
function updateMethodUI(method: string) {
  if (!methodEmailBtn || !methodSmsBtn) return;

  if (method === 'sms') {
    methodSmsBtn.classList.remove('bg-gray-600', 'text-white');
    methodSmsBtn.classList.add('bg-emerald-400', 'text-black', 'font-semibold');
    methodEmailBtn.classList.remove('bg-emerald-400', 'text-black', 'font-semibold');
    methodEmailBtn.classList.add('bg-gray-600', 'text-white');
  } else {
    methodEmailBtn.classList.remove('bg-gray-600', 'text-white');
    methodEmailBtn.classList.add('bg-emerald-400', 'text-black', 'font-semibold');
    methodSmsBtn.classList.remove('bg-emerald-400', 'text-black', 'font-semibold');
    methodSmsBtn.classList.add('bg-gray-600', 'text-white');
  }
}

// Open the phone number modal
function openPhoneModal() {
  if (phoneModal) {
    phoneModal.classList.remove('hidden');
    if (phoneError) phoneError.textContent = '';
    if (phoneInput) phoneInput.focus();
  }
}

// Close the phone number modal
function closePhoneModal() {
  if (phoneModal) {
    phoneModal.classList.add('hidden');
  }
}

// Save phone number, then switch method to SMS
async function savePhoneAndSetSms() {
  if (!phoneInput || !phoneError) return;

  const phone = phoneInput.value.trim();
  phoneError.textContent = '';

  if (!phone) {
    phoneError.textContent = 'Phone number is required';
    return;
  }

  if (!/^\+[0-9]{10,15}$/.test(phone)) {
    phoneError.textContent = 'Use E.164 format (e.g. +1234567890)';
    return;
  }

  try {
    // Save phone number
    const phoneRes = await fetch('/api/auth/2fa/phone', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone })
    });

    const phoneData = await phoneRes.json();
    if (!phoneData.success) {
      phoneError.textContent = phoneData.error || 'Failed to save phone number';
      return;
    }

    // Switch method to SMS
    const methodRes = await fetch('/api/auth/2fa/method', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'sms' })
    });

    const methodData = await methodRes.json();
    if (methodData.success) {
      currentMethod = 'sms';
      updateMethodUI('sms');
      closePhoneModal();
    } else {
      phoneError.textContent = methodData.error || 'Failed to switch to SMS';
    }
  } catch (error) {
    console.error('Failed to save phone number:', error);
    phoneError.textContent = 'Network error';
  }
}

// Switch to email method
async function setEmailMethod() {
  try {
    const response = await fetch('/api/auth/2fa/method', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'email' })
    });

    const data = await response.json();

    if (data.success) {
      currentMethod = 'email';
      updateMethodUI('email');
    } else {
      alert(data.error || 'Failed to update 2FA method');
    }
  } catch (error) {
    console.error('Failed to set 2FA method:', error);
    alert('Failed to update 2FA method');
  }
}

// Toggle 2FA on/off
async function toggle2FA(enable: boolean) {
  const endpoint = enable ? '/api/auth/2fa/enable' : '/api/auth/2fa/disable';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (data.success) {
      logger.log(data.message);
      currentlyEnabled = data.two_factor_enabled;
      updateToggleUI(data.two_factor_enabled);
    } else {
      console.error('Failed to toggle 2FA:', data.error);
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error('Failed to toggle 2FA:', error);
    alert('Failed to update 2FA settings');
  }
}

if (toggleBtn) {
  load2FAStatus();

  const observer = new MutationObserver(() => {
    const settingsSection = document.getElementById('settings');
    if (settingsSection && !settingsSection.classList.contains('hidden')) {
      load2FAStatus();
    }
  });

  const settingsSection = document.getElementById('settings');
  if (settingsSection) {
    observer.observe(settingsSection, { attributes: true, attributeFilter: ['class'] });
  }

  toggleBtn.addEventListener('click', async () => {
    if (isOAuthUser) {
      alert('Two-factor authentication is not available for Google accounts. Your account is already secured by Google.');
      return;
    }

    currentlyEnabled = !currentlyEnabled;
    updateToggleUI(currentlyEnabled);
    await toggle2FA(currentlyEnabled);
  });
}

// Email button: switch to email
if (methodEmailBtn) {
  methodEmailBtn.addEventListener('click', () => setEmailMethod());
}

// SMS button: open the phone number modal
if (methodSmsBtn) {
  methodSmsBtn.addEventListener('click', () => openPhoneModal());
}

// Phone modal: cancel button
if (phoneCancelBtn) {
  phoneCancelBtn.addEventListener('click', () => closePhoneModal());
}

// Phone modal: form submit
if (phoneForm) {
  phoneForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePhoneAndSetSms();
  });
}

// Close modal when clicking the backdrop
if (phoneModal) {
  phoneModal.addEventListener('click', (e) => {
    if (e.target === phoneModal) {
      closePhoneModal();
    }
  });
}
