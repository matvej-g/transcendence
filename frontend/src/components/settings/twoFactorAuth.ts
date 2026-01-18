import { getCurrentUserId } from '../auth/authUtils.js';

const toggleBtn = document.getElementById('dropdown-toggle-2fa');

// Track current 2FA state
let currentlyEnabled = false;
let isOAuthUser = false;

// Fetch current 2FA status on page load
async function load2FAStatus() {
  try {
    // Check if user is OAuth user
    const userId = getCurrentUserId();
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
    
    // If unauthorized (not logged in), silently return
    if (response.status === 401) {
      return;
    }
    
    const data = await response.json();
    
    if (data.success && toggleBtn) {
      const enabled = data.two_factor_enabled;
      currentlyEnabled = enabled; // Update state with DB value
      updateToggleUI(enabled);
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
      body: JSON.stringify({})  // Send empty JSON object
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(data.message);
      currentlyEnabled = data.two_factor_enabled; // Update state after API call
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
  // Load status on page load
  load2FAStatus();
  
  // Reload status when settings page becomes visible
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
    // Check if user is OAuth user
    if (isOAuthUser) {
      alert('Two-factor authentication is not available for Google accounts. Your account is already secured by Google.');
      return;
    }
    
    // Toggle the state
    currentlyEnabled = !currentlyEnabled;
    
    // Update UI immediately for better UX
    updateToggleUI(currentlyEnabled);
    
    // Call API to persist the change
    await toggle2FA(currentlyEnabled);
  });
}

