// frontend/src/languages/languageButton.ts
import { setLang, getLang, onLangChange } from "./i18n.js";
function createSwitcherElement() {
    const wrapper = document.createElement("div");
    wrapper.className = "absolute top-3 right-3";
    wrapper.innerHTML = `
    <button id="languageButton"
            type="button"
            class="flex items-center gap-1 px-2 py-1 rounded-md border border-gray-300 text-xs hover:bg-gray-50 active:bg-gray-100">
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
function updateButtonLabel() {
    const button = document.getElementById("languageButton");
    if (!button)
        return;
    const label = button.querySelector("[data-lang-label]");
    if (!label)
        return;
    const lang = getLang();
    label.textContent = lang === "en" ? "🇬🇧 EN" : "🇷🇺 RU";
}
function toggleMenu(open) {
    const menu = document.getElementById("languageMenu");
    if (!menu)
        return;
    const isOpen = menu.dataset.open === "true";
    const next = open ?? !isOpen;
    menu.dataset.open = next ? "true" : "false";
    menu.style.display = next ? "block" : "none";
}
function handleOutsideClick(e) {
    const menu = document.getElementById("languageMenu");
    const button = document.getElementById("languageButton");
    if (!menu || !button)
        return;
    const target = e.target;
    if (!menu.contains(target) && !button.contains(target)) {
        toggleMenu(false);
    }
}
export function initLanguageButton() {
    // 1) mount into placeholder if present
    const container = document.querySelector("[data-lang-switcher]");
    if (container) {
        const el = createSwitcherElement(); // 👈 HERE it’s used
        container.appendChild(el);
    }
    // 2) wire up events
    const button = document.getElementById("languageButton");
    const menu = document.getElementById("languageMenu");
    if (!button || !menu) {
        return;
    }
    // initial menu state
    menu.dataset.open = "false";
    menu.style.display = "none";
    // toggle on button click
    button.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    // select language
    menu.querySelectorAll("[data-lang]").forEach((item) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const langAttr = item.dataset.lang;
            if (langAttr === "en" || langAttr === "ru") {
                setLang(langAttr);
            }
            toggleMenu(false);
        });
    });
    // close on outside click
    document.addEventListener("click", handleOutsideClick);
    // keep button label in sync
    updateButtonLabel();
    onLangChange(() => updateButtonLabel());
}
