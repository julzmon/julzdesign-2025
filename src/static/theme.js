(function () {
  const STORAGE_KEY = "julzdesign-theme";
  const THEMES = ["system", "light", "dark"];
  const root = document.documentElement;
  const storage = getStorage();
  const media = typeof matchMedia === "function"
    ? matchMedia("(prefers-color-scheme: dark)")
    : null;

  function getStorage() {
    try {
      return window.localStorage || localStorage;
    } catch (error) {
      return null;
    }
  }

  function normalizeTheme(theme) {
    return THEMES.includes(theme) ? theme : "system";
  }

  function getStoredTheme() {
    return normalizeTheme(storage ? storage.getItem(STORAGE_KEY) : null);
  }

  function resolveTheme(theme) {
    const preference = normalizeTheme(theme);
    if (preference !== "system") return preference;
    return media && media.matches ? "dark" : "light";
  }

  function setRootTheme(theme) {
    const preference = normalizeTheme(theme);
    const resolvedTheme = resolveTheme(preference);

    if (preference === "system") {
      delete root.dataset.theme;
      root.removeAttribute("data-theme");
    } else {
      root.dataset.theme = preference;
    }

    root.dataset.resolvedTheme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  }

  function applyTheme(theme) {
    const preference = normalizeTheme(theme);
    if (storage) {
      storage.setItem(STORAGE_KEY, preference);
    }
    setRootTheme(preference);
    updateControls(preference);
  }

  function updateControls(preference) {
    const currentPreference = normalizeTheme(preference);
    const trigger = document.querySelector("[data-theme-trigger]");
    const options = document.querySelectorAll("[data-theme-option]");

    if (trigger) {
      trigger.dataset.themeCurrent = currentPreference;
      trigger.setAttribute("aria-label", `Theme: ${labelTheme(currentPreference)}`);
    }

    options.forEach((option) => {
      const isActive = option.dataset.themeOption === currentPreference;
      option.setAttribute("aria-checked", String(isActive));
      option.classList.toggle("theme-option-active", isActive);

      const check = option.querySelector("[data-theme-check]");
      if (check) {
        check.hidden = !isActive;
      }
    });
  }

  function labelTheme(theme) {
    return theme.slice(0, 1).toUpperCase() + theme.slice(1);
  }

  function initThemeMenu() {
    const trigger = document.querySelector("[data-theme-trigger]");
    const menu = document.querySelector("#theme-menu");
    const options = document.querySelectorAll("[data-theme-option]");

    if (!trigger || !menu) return;

    function isMenuOpen() {
      return typeof menu.matches === "function" && menu.matches(":popover-open");
    }

    options.forEach((option) => {
      option.addEventListener("click", () => {
        applyTheme(option.dataset.themeOption);
        if (typeof menu.hidePopover === "function") {
          menu.hidePopover();
        }
        trigger.focus();
      });
    });

    trigger.addEventListener("click", () => {
      requestAnimationFrame(() => positionThemeMenu(trigger, menu));
    });

    menu.addEventListener("beforetoggle", (event) => {
      if (event.newState === "open") {
        positionThemeMenu(trigger, menu);
      }
    });

    menu.addEventListener("toggle", () => {
      const isOpen = isMenuOpen();
      trigger.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        positionThemeMenu(trigger, menu);
      }
    });

    window.addEventListener("resize", () => {
      if (isMenuOpen()) {
        positionThemeMenu(trigger, menu);
      }
    });

    updateControls(getStoredTheme());
  }

  function positionThemeMenu(trigger, menu) {
    const gap = 8;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth || 160;
    const menuHeight = menu.offsetHeight || 128;
    const left = Math.min(
      window.innerWidth - menuWidth - gap,
      Math.max(gap, rect.right - menuWidth)
    );
    const top = Math.min(
      window.innerHeight - menuHeight - gap,
      Math.max(gap, rect.bottom + gap)
    );

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  setRootTheme(getStoredTheme());

  if (media) {
    const onSystemThemeChange = () => {
      if (getStoredTheme() === "system") {
        setRootTheme("system");
        updateControls("system");
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onSystemThemeChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onSystemThemeChange);
    }
  }

  document.addEventListener("DOMContentLoaded", initThemeMenu);

  window.JulzTheme = {
    applyTheme,
    getStoredTheme,
    resolveTheme,
  };
})();
