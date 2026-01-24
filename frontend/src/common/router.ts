import { clearCurrentUserId, setUserOffline, clearCurrentUsername, getCurrentUserId, setCurrentUserId, setCurrentUsername, setUserOnline } from '../components/auth/authUtils.js';
import { initFriendsSection} from '../components/friends/friendsContent.js';
import { initProfile, reloadUsername, reloadAvatar, reloadMatchHistory, reloadStats } from '../components/profile/profile.js';
import { loadFriendProfile } from '../components/friendProfile/friendProfile.js';
import { logger } from '../utils/logger.js';

// Simple router to handle navigation between sections
const sections: Record<string, HTMLElement | null> = {
  'auth': document.getElementById('auth-section'),
  'profile': document.getElementById('profile-section'),
  'friend-profile': document.getElementById('friend-profile-section'),
  'game': document.getElementById('game-section'),
  'friends': document.getElementById('friends-section'),
  'chat': document.getElementById('chat-section'),
  'verify-2fa': document.getElementById('verify-2fa-section'),
  'verify-registration': document.getElementById('verify-registration-section'),
  'oauth-callback': document.getElementById('oauth-callback-section'),
  'notfound': document.getElementById('notfound-section'),
};


// Special modal/overlay sections (not part of main navigation)
const editUsernameModal = document.getElementById('settings-edit-username');
const uploadAvatarModal = document.getElementById('settings-upload-avatar');
const changePasswordModal = document.getElementById('settings-change-password');
const changeEmailModal = document.getElementById('settings-change-email');

const authNavbar = document.getElementById('auth-navbar');
const navbar = document.getElementById('navbar');
const footer = document.getElementById('footer');


function resolveSection(sectionId: string): string {
  // Special case: settings/edit-username (modal)
  if (sectionId === 'settings' && window.location.hash.includes('edit-username')) {
    return 'settings-edit-username';
  }
  // Special case: settings/upload-avatar (modal)
  if (sectionId === 'settings' && window.location.hash.includes('upload-avatar')) {
    return 'settings-upload-avatar';
  }
  // Special case: settings/change-password (modal)
  if (sectionId === 'settings' && window.location.hash.includes('change-password')) {
    return 'settings-change-password';
  }
  // Special case: settings/change-email (modal)
  if (sectionId === 'settings' && window.location.hash.includes('change-email')) {
    return 'settings-change-email';
  }
  // Support hash params: section?param=value
  const baseSectionId = sectionId.split('?')[0];
  if (sections[baseSectionId]) {
    return baseSectionId;
  }
  // Unknown section requested — warn and notify consumers.
  logger.warn(`Router: unknown section "${sectionId}", showing 'notfound' section`);
  window.dispatchEvent(new CustomEvent('router:notfound', { detail: { section: sectionId } }));
  return 'notfound';
}


// Flags to track if sections have been loaded
let profileLoaded = false;
let friendsLoaded = false;

function showSection(sectionId: string): void {
  const target = resolveSection(sectionId);

  // Hide all main sections
  Object.values(sections).forEach(section => {
    if (section) section.classList.add('hidden');
  });

  // Hide modal overlays by default
  if (editUsernameModal) editUsernameModal.classList.add('hidden');
  if (uploadAvatarModal) uploadAvatarModal.classList.add('hidden');
  if (changePasswordModal) changePasswordModal.classList.add('hidden');
  if (changeEmailModal) changeEmailModal.classList.add('hidden');

  if (target === 'settings-edit-username') {
    // Show modal, keep navbars visible
    editUsernameModal?.classList.remove('hidden');
    navbar?.classList.remove('hidden');
    authNavbar?.classList.add('hidden');
    footer?.classList.remove('hidden');
    return;
  }
  if (target === 'settings-upload-avatar') {
    // Show modal, keep navbars visible
    uploadAvatarModal?.classList.remove('hidden');
    navbar?.classList.remove('hidden');
    authNavbar?.classList.add('hidden');
    footer?.classList.remove('hidden');
    return;
  }
  if (target === 'settings-change-password') {
    // Show modal, keep navbars visible
    changePasswordModal?.classList.remove('hidden');
    navbar?.classList.remove('hidden');
    authNavbar?.classList.add('hidden');
    footer?.classList.remove('hidden');
    return;
  }
  if (target === 'settings-change-email') {
    // Show modal, keep navbars visible
    changeEmailModal?.classList.remove('hidden');
    navbar?.classList.remove('hidden');
    authNavbar?.classList.add('hidden');
    footer?.classList.remove('hidden');
    return;
  }

  // Show selected (or fallback) section
  sections[target]?.classList.remove('hidden');

  // If profile section, load only once unless reset
  if (target === 'profile') {
    if (!profileLoaded) {
      profileLoaded = true;
      initProfile().catch(e => logger.warn('[router] initProfile failed', e));
      }
  }

  // If friends section, load only once unless reset
  if (target === 'friends') {
    if (!friendsLoaded) {
      friendsLoaded = true;
      initFriendsSection();
    }
  }

  // If friend-profile section, extract userId from hash and load profile
  if (target === 'friend-profile') {
    const hash = window.location.hash;
    const match = hash.match(/^#friend-profile\/(\d+)/); // Extract userId
    if (match && match[1]) {
      const userId = parseInt(match[1], 10);
      loadFriendProfile(userId).catch(e => logger.warn('[router] loadFriendProfile failed', e));
    } else {
      logger.warn('[router] friend-profile accessed without valid userId');
    }
  }

  // Show/hide navbars and footer based on section
  if (target === 'auth' || target === 'verify-2fa' || target === 'verify-registration' || target === 'oauth-callback') {
    authNavbar?.classList.remove('hidden');
    navbar?.classList.add('hidden');
    footer?.classList.remove('hidden');
  } else if (target === 'game') {
    authNavbar?.classList.add('hidden');
    navbar?.classList.remove('hidden');
    footer?.classList.add('hidden');
  } else {
    authNavbar?.classList.add('hidden');
    navbar?.classList.remove('hidden');
    footer?.classList.remove('hidden');
  }
}

// Handle OAuth callback
async function handleOAuthCallback(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    alert('Google authentication was cancelled or failed.');
    window.location.href = '/index.html#auth';
    return;
  }

  if (!code) {
    alert('Invalid OAuth response from Google.');
    window.location.href = '/index.html#auth';
    return;
  }

  try {
    // Forward the code to our backend callback endpoint
    const res = await fetch(`/api/auth/google/callback?code=${encodeURIComponent(code)}`);
    const data = await res.json();

    if (data.success && data.user) {
      setCurrentUserId(data.user.id);
      setCurrentUsername(data.user.username);

      try { await setUserOnline(); } catch (e) { logger.warn('[auth] setUserOnline failed', e); }

      window.location.href = '/index.html#profile';
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (err) {
    logger.error('OAuth callback error:', err);
    alert('Failed to complete Google sign-in: ' + (err as Error).message);
    window.location.href = '/index.html#auth';
  }
}

// Handle hash navigation


window.addEventListener('hashchange', async () => {
  const hash = window.location.hash.slice(1);
  // Special case: settings/edit-username
  if (hash.startsWith('settings/edit-username')) {
    showSection('settings');
    return;
  }
  // Special case: settings/upload-avatar
  if (hash.startsWith('settings/upload-avatar')) {
    showSection('settings');
    return;
  }
  // Special case: settings/change-password
  if (hash.startsWith('settings/change-password')) {
    showSection('settings');
    return;
  }
  // Special case: settings/change-email
  if (hash.startsWith('settings/change-email')) {
    showSection('settings');
    return;
  }
  const section = hash.split('/')[0] || 'auth';
  const isLoggedIn = getCurrentUserId();
  // If trying to access a protected section and not logged in, redirect to login
  const protectedSections = ['profile', 'friend-profile', 'game', 'friends', 'chat'];
  if (protectedSections.includes(section) && !isLoggedIn) {
    window.location.hash = '#auth';
    showSection('auth');
    return;
  }
  showSection(section);

  // Handle selective profile reloads
  if (section === 'profile' && window.__profileReload) {
    const reload = window.__profileReload;
    if (reload.username) await reloadUsername();
    if (reload.avatar) await reloadAvatar();
    if (reload.matchHistory) await reloadMatchHistory();
    if (reload.stats) await reloadStats();
    window.__profileReload = null;
  }
});

// Logout button
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  // Set user offline first (wait for it to complete)
  try {
    await setUserOffline();
  } catch (e) {
    logger.warn('[auth] setUserOffline failed', e);
  }

  // Call logout endpoint to clear JWT cookie
  try {
    await fetch('/api/user/logout', {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    logger.error('Logout endpoint failed:', error);
  }

  // Clear localStorage
  clearCurrentUserId();
  clearCurrentUsername();
  
  // Redirect and reload to clear all state (with cache bust)
  window.location.href = '/index.html?t=' + Date.now() + '#auth';
});

// Handle browser/tab close - set user offline
window.addEventListener('beforeunload', () => {
  const userId = getCurrentUserId();
  if (userId) {
    // Use sendBeacon for reliable delivery even as page unloads
    // Note: setUserOffline() uses fetch which may be cancelled, so we use sendBeacon directly
    const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
    navigator.sendBeacon('/api/user/offline', blob);
  }
});

// Notfound "Go to Home" button (if present)
document.getElementById('notfoundHomeBtn')?.addEventListener('click', () => {
  window.location.hash = '#';
});

// Initial load
// Check if this is an OAuth callback (has ?code= in URL)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('code') || urlParams.has('error')) {
  // Show OAuth callback section and handle the callback
  showSection('oauth-callback');
  handleOAuthCallback();
} else {
  // Normal routing - validate localStorage against backend JWT
  (async () => {
    const localUserId = getCurrentUserId();
    
    // If we have a userId in localStorage, verify it matches the backend JWT
    if (localUserId) {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          // If backend user doesn't match localStorage, update localStorage
          if (String(userData.id) !== String(localUserId)) {
            setCurrentUserId(userData.id);
            setCurrentUsername(userData.username || '');
          }
        } else {
          // JWT cookie invalid - clear localStorage
          clearCurrentUserId();
          clearCurrentUsername();
        }
      } catch (err) {
        logger.warn('[router] Failed to validate user', err);
      }
    }

    // IMPORTANT: Routing logic must happen AFTER validation
    const initialHash = window.location.hash.slice(1);
    const isLoggedIn = getCurrentUserId();
    const protectedSections = ['profile', 'friend-profile', 'game', 'friends', 'chat'];
    const initialSection = initialHash.split('/')[0] || 'auth';

     // Connect WebSocket if user is logged in
    if (isLoggedIn) {
      const { appWs } = await import('../ws/appWs.js');
      appWs.connect();
    }


    if (isLoggedIn && (initialSection === 'auth' || initialSection === '')) {
      // Logged in user on auth page → redirect to profile
      window.location.hash = '#profile';
      showSection('profile');
    } else if (protectedSections.includes(initialSection) && !isLoggedIn) {
      // Not logged in trying to access protected section → redirect to auth
      window.location.hash = '#auth';
      showSection('auth');
    } else if (initialHash.startsWith('settings/edit-username')) {
      showSection('settings');
    } else if (initialHash.startsWith('settings/upload-avatar')) {
      showSection('settings');
    } else if (initialHash.startsWith('settings/change-password')) {
      showSection('settings');
    } else if (initialHash.startsWith('settings/change-email')) {
      showSection('settings');
    } else {
      showSection(initialSection);
    }
  })();
}
