// Simple router to handle navigation between sections
const sections: Record<string, HTMLElement | null> = {
  'auth': document.getElementById('auth-section'),
  'profile': document.getElementById('profile-section'),
  'game': document.getElementById('game-section'),
  'friends': document.getElementById('friends-section'),
  'chat': document.getElementById('chat-section'),
};

const authNavbar = document.getElementById('auth-navbar');
const navbar = document.getElementById('navbar');
const footer = document.getElementById('footer');

function showSection(sectionId: string): void {
  // Hide all sections
  Object.values(sections).forEach(section => {
    if (section) {
      section.classList.add('hidden');
    }
  });

  // Show selected section
  if (sections[sectionId]) {
    sections[sectionId]?.classList.remove('hidden');
  }

  // Show/hide navbars and footer based on section
  if (sectionId === 'auth') {
    authNavbar?.classList.remove('hidden');
    navbar?.classList.add('hidden');
    // footer?.classList.remove('hidden');
  } else {
    authNavbar?.classList.add('hidden');
    navbar?.classList.remove('hidden');
    // footer?.classList.remove('hidden');
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
  window.location.hash = '#';
});

// Initial load
const initialHash = window.location.hash.slice(1);
const initialSection = initialHash.split('/')[0] || 'auth';
showSection(initialSection);
