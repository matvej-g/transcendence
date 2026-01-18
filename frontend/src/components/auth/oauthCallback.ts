import { setCurrentUserId, setCurrentUsername, setUserOnline } from './authUtils.js';
import { appWs } from '../../ws/appWs.js';


if (window.location.pathname === '/api/auth/google/callback') {
  console.log('[OAuth] Detected Google OAuth callback');
 
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // Show loading state
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(to bottom right, #1a202c, #000000); color: white; font-family: sans-serif;">
        <div style="text-align: center;">
          <h2>Completing Google sign-in...</h2>
          <p>Please wait</p>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.location.href = '/index.html#profile';
    }, 1000);
  } else {
    // No code means something went wrong
    alert('Google authentication failed. Please try again.');
    window.location.href = '/index.html';
  }
}
