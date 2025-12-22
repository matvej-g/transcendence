import { clearCurrentUserId, setUserOffline } from '../components/auth/authUtils.js';

// Simple router to handle navigation between sections
const sections: Record<string, HTMLElement | null> = {
  'auth': document.getElementById('auth-section'),
  'profile': document.getElementById('profile-section'),
  'game': document.getElementById('game-section'),
  'friends': document.getElementById('friends-section'),
  'chat': document.getElementById('chat-section'),
  'notfound': document.getElementById('notfound-section'),
};

const authNavbar = document.getElementById('auth-navbar');
const navbar = document.getElementById('navbar');
const footer = document.getElementById('footer');

function resolveSection(sectionId: string): string {
  if (sections[sectionId]) {
    return sectionId;
  }

  // Unknown section requested — warn and notify consumers.
  // Consumers can listen for the `router:notfound` event to show a custom 404 UI.
  console.warn(`Router: unknown section "${sectionId}", showing 'notfound' section`);
  window.dispatchEvent(new CustomEvent('router:notfound', { detail: { section: sectionId } }));

  // Show the dedicated notfound section
  return 'notfound';
}

function showSection(sectionId: string): void {
    const target = resolveSection(sectionId);

  // Hide all sections
  Object.values(sections).forEach(section => {
    if (section) {
      section.classList.add('hidden');
    }
  });

  // Show selected (or fallback) section
  sections[target]?.classList.remove('hidden');

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
  const section = hash.split('/')[0] || 'auth';
  showSection(section);
});

// Logout button
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  // mark user offline on server (best-effort)
  setUserOffline().catch((e) => console.warn('[auth] setUserOffline failed', e));
  clearCurrentUserId();
  window.location.hash = '#';
});

// Notfound "Go to Home" button (if present)
document.getElementById('notfoundHomeBtn')?.addEventListener('click', () => {
  window.location.hash = '#';
});

// Initial load
const initialHash = window.location.hash.slice(1);  //read everything after #
const initialSection = initialHash.split('/')[0] || 'auth'; // Extracts the first segment before a slash
showSection(initialSection);
