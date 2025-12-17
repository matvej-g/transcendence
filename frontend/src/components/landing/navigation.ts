// here we will have the logic needed to naviagate to this page
import { UserDataPublic } from "../../common/types";

// theoretically a bad actor could try to call this function directly
// but we would have session cookies and/or the jwt token to verify identity
export function navigateToLandingPage(userData: UserDataPublic | null): void {

	// this section should be replaced with a call to the single page_view entity
	// i.e. replace with step 1 and step 2 below in a single call
	// Use hash navigation to trigger the SPA router in index-profile.html
	try {
		window.location.hash = '#profile';
	} catch (e) {
		console.warn('[navigateToLandingPage] failed to set hash', e);
	}

	const navbar = document.getElementById('navbar');
	const footer = document.getElementById('footer');
	const profile = document.getElementById('profile-section');
	const auth = document.getElementById('auth-section');

	if (auth) auth.classList.add('hidden');
	if (profile) profile.classList.remove('hidden');
	if (navbar) navbar.classList.remove('hidden');
	if (footer) footer.classList.remove('hidden');

	if (userData) {
		// step 3 and 4 here
	}
	// todo: 
	// 1) hide all elevents
	// 2) show only landing page elements
	// 3) do api calls to backend for whatever data
	// 4) display said data

}