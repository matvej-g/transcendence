
const toggleBtn = document.getElementById('dropdown-toggle-2fa');

if (toggleBtn) {
  let enabled = false;
  toggleBtn.addEventListener('click', () => {
    enabled = !enabled;
    // Toggle color and position
    if (enabled) {
      toggleBtn.classList.remove('bg-gray-400');
      toggleBtn.classList.add('bg-emerald-400');
      // Move the knob to the right
      (toggleBtn.querySelector('span.inline-block') as HTMLElement).style.transform = 'translateX(24px)';
    } else {
      toggleBtn.classList.remove('bg-emerald-400');
      toggleBtn.classList.add('bg-gray-400');
      // Move the knob to the left
      (toggleBtn.querySelector('span.inline-block') as HTMLElement).style.transform = 'translateX(0)';
    }
    // Placeholder: Insert 2FA enable/disable logic here
    // e.g., call API or update state
  });
}
