import { clearCurrentUserId, setUserOffline, clearCurrentUsername} from '../components/auth/authUtils.js';
import { onFriendsSectionShown} from '../components/friends/friendsContent.js'

// Simple router to handle navigation between sections
const sections: Record<string, HTMLElement | null> = {
  'auth': document.getElementById('auth-section'),
  'profile': document.getElementById('profile-section'),
  'game': document.getElementById('game-section'),
  'friends': document.getElementById('friends-section'),
  'chat': document.getElementById('chat-section'),
  'notfound': document.getElementById('notfound-section'),
};


// Special modal/overlay sections (not part of main navigation)
const editUsernameModal = document.getElementById('settings-edit-username');
const uploadAvatarModal = document.getElementById('settings-upload-avatar');

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
  if (sections[sectionId]) {
    return sectionId;
  }
  // Unknown section requested — warn and notify consumers.
  console.warn(`Router: unknown section "${sectionId}", showing 'notfound' section`);
  window.dispatchEvent(new CustomEvent('router:notfound', { detail: { section: sectionId } }));
  return 'notfound';
}

function showSection(sectionId: string): void {
  const target = resolveSection(sectionId);

  // Hide all main sections
  Object.values(sections).forEach(section => {
    if (section) section.classList.add('hidden');
  });

  // Hide modal overlays by default
  if (editUsernameModal) editUsernameModal.classList.add('hidden');
  if (uploadAvatarModal) uploadAvatarModal.classList.add('hidden');

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

  // Show selected (or fallback) section
  sections[target]?.classList.remove('hidden');

  // If friends section, immediately populate lists
  if (target === 'friends') {
    onFriendsSectionShown();
  }

  // Show/hide navbars and footer based on section
  if (target === 'auth') {
    authNavbar?.classList.remove('hidden');
    navbar?.classList.add('hidden');
  } else {
    authNavbar?.classList.add('hidden');
    navbar?.classList.remove('hidden');
  }
}

// Handle hash navigation


window.addEventListener('hashchange', () => {
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
  const section = hash.split('/')[0] || 'auth';
  showSection(section);
});

// Logout button
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  // mark user offline on server (best-effort)
  setUserOffline().catch((e) => console.warn('[auth] setUserOffline failed', e));
  clearCurrentUserId();
  clearCurrentUsername();
  window.location.hash = '#';
});

// Notfound "Go to Home" button (if present)
document.getElementById('notfoundHomeBtn')?.addEventListener('click', () => {
  window.location.hash = '#';
});



// Initial load
const initialHash = window.location.hash.slice(1);
if (initialHash.startsWith('settings/edit-username')) {
  showSection('settings');
} else if (initialHash.startsWith('settings/upload-avatar')) {
  showSection('settings');
} else {
  const initialSection = initialHash.split('/')[0] || 'auth';
  showSection(initialSection);
}
