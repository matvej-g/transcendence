
const toggleBtn = document.getElementById('dropdown-toggle-2fa');

// Fetch current 2FA status on page load
async function load2FAStatus() {
  try {
    const response = await fetch('/api/auth/2fa/status', {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success && toggleBtn) {
      const enabled = data.two_factor_enabled;
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
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(data.message);
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
  // Load current status on page load
  load2FAStatus();
  
  let currentlyEnabled = false;
  
  toggleBtn.addEventListener('click', async () => {
    // Toggle the state
    currentlyEnabled = !currentlyEnabled;
    
    // Update UI immediately for better UX
    updateToggleUI(currentlyEnabled);
    
    // Call API to persist the change
    await toggle2FA(currentlyEnabled);
  });
}

