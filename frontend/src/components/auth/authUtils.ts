/**
 * Auth-related small helpers.
 */
export function getCurrentUserId(): string | null {
  const id = localStorage.getItem('userId');
  if (!id) return null;
  const trimmed = id.trim();
  return trimmed === '' ? null : trimmed;
}

export function getCurrentUserIdNumber(): number | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const n = Number(id);
  if (!Number.isFinite(n) || Number.isNaN(n)) return null;
  return Math.floor(n);
}

export function setCurrentUserId(id: string | number): void {
  localStorage.setItem('userId', String(id));
  console.log('User data stored in localStorage: id = ', id);
}

export function clearCurrentUserId(): void {
  localStorage.removeItem('userId');
  console.log('User data removed from localStorage.');
}
