// frontend/src/languages/languageButton.ts

import { setLang, getLang, onLangChange, type Lang } from "./i18n.js";


// convenience functions for menu control
function closeMenu() {
  toggleMenu(false);
}

function openMenu() {
  toggleMenu(true);
}

function switchMenu() {
  toggleMenu();
}


// creates the element structure
// does not add anything to DOM itself
function createSwitcherElement(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "absolute top-16 right-3";
  wrapper.innerHTML = `
    <button id="languageButton"
            type="button"
            class="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 text-xs text-white hover:bg-emerald-400 active:bg-gray-100">
      <span data-lang-label>🇬🇧 EN</span>
      <span class="text-[10px]">▼</span>
    </button>

    <div id="languageMenu"
         class="mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-md text-xs">
      <button type="button"
              data-lang="en"
              class="w-full text-left px-2 py-1 hover:bg-gray-100 flex items-center gap-1">
        <span>🇬🇧</span><span>English</span>
      </button>
      <button type="button"
              data-lang="ru"
              class="w-full text-left px-2 py-1 hover:bg-gray-100 flex items-center gap-1">
        <span>🇷🇺</span><span>Русский</span>
      </button>
    </div>
  `;

  return wrapper;
}

// changes button label based on current language
function updateButtonLabel() {
  const button = document.getElementById("languageButton");
  if (!button) return;
  const label = button.querySelector<HTMLElement>("[data-lang-label]");
  if (!label) return;

  const lang = getLang();
  label.textContent = lang === "en" ? "🇬🇧 EN" : "🇷🇺 RU";
}

// shows or hides the language menu
// if true/false is passed, forces that state
// otherwise switches state
function toggleMenu(open?: boolean) {
  const menu = document.getElementById("languageMenu");
  if (!menu) return;

  // current state
  const isOpen = menu.dataset.open === "true";
  // determine next state
  const next = open ?? !isOpen;

  // update menu state
  menu.dataset.open = next ? "true" : "false";
  // show/hide
  menu.style.display = next ? "block" : "none";
}

// closes the menu if clicked outside of it
function handleOutsideClick(e: MouseEvent) {
  const menu = document.getElementById("languageMenu");
  const button = document.getElementById("languageButton");
  if (!menu || !button) return;

  // what did we click on?
  const target = e.target as Node;
  // was it part of the menu or button?
  if (!menu.contains(target) && !button.contains(target)) {
    closeMenu();
  }
}

// creates the button, put's it into the DOM and hooks up all events
export function initLanguageButton() {
  // 1) mount into placeholder if present
  const container = document.querySelector<HTMLElement>("[data-lang-switcher]");
  if (container) {
    const el = createSwitcherElement(); // generate element
    container.appendChild(el); // mount into DOM
  }

  // 2) check elements
  const button = document.getElementById("languageButton");
  const menu = document.getElementById("languageMenu");
  if (!button || !menu) {
    return;
  }

  // initial menu state (does't show)
  menu.dataset.open = "false";
  menu.style.display = "none";

  // toggle on button click
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    switchMenu();
  });

  // add an action for every element in the menu that has property data-lang (for every language option)
  menu.querySelectorAll<HTMLElement>("[data-lang]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();

      const langAttr = item.dataset.lang;
      if (langAttr === "en" || langAttr === "ru") {
        setLang(langAttr as Lang);
      }
      // close menu after selection
      closeMenu();
    });
  });

  // closes menu on outside click (when click around menu)
  document.addEventListener("click", handleOutsideClick);

  // keep button label in sync
  updateButtonLabel();

  // add cb to lang change events (update button label on lang change)
  onLangChange(() => updateButtonLabel());
}
