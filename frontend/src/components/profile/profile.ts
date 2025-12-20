// profile initializer: fetch user id=1 and populate nickname
async function initProfile(): Promise<void> {
  try {
    const res = await fetch('/api/user/1');
    if (!res.ok) {
      console.warn('[profile] fetch failed', res.status);
      return;
    }
    const data = await res.json();
    // backend returns the user object directly
    const username = data?.username ?? data?.userName ?? null;
    if (!username) return;

    // main avatar name
    const nameEl = document.querySelector('.avatar-name h2') as HTMLElement | null;
    if (nameEl) nameEl.textContent = username;

    // optional: replace placeholders in match-history and other nickname slots
    document.querySelectorAll('.nickname').forEach(el => {
      if (el.textContent && el.textContent.trim().toLowerCase() === 'nickname') {
        el.textContent = username;
      }
    });
  } catch (e) {
    console.warn('[profile] error', e);
  }
}

// Run on module load — safe to run even if profile section is hidden
initProfile().catch(e => console.warn('[profile] init failed', e));

export { initProfile };
