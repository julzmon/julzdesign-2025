import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const layout = fs.readFileSync("src/_includes/default.njk", "utf8");
const homePage = fs.readFileSync("src/index.html", "utf8");
const prudentialPage = fs.readFileSync("src/pru.html", "utf8");
const styles = fs.readFileSync("src/styles/site.css", "utf8");
const westrockPage = fs.readFileSync("src/wtr.html", "utf8");

test("layout exposes a three-choice theme menu", () => {
  assert.match(layout, /<meta name="color-scheme" content="light dark"/);
  assert.match(layout, /id="theme-menu"/);
  assert.match(layout, /popovertarget="theme-menu"/);
  assert.match(layout, /popover="auto"/);
  assert.match(layout, /data-theme-option="system"/);
  assert.match(layout, /data-theme-option="light"/);
  assert.match(layout, /data-theme-option="dark"/);
  assert.doesNotMatch(layout, /role="menu"/);
  assert.doesNotMatch(layout, /role="menuitemradio"/);
  assert.doesNotMatch(layout, /aria-haspopup/);
  assert.match(layout, /aria-pressed="true" data-theme-option="system"/);
  assert.match(layout, /aria-pressed="false" data-theme-option="light"/);
  assert.match(layout, /aria-pressed="false" data-theme-option="dark"/);
  assert.match(layout, /src="\{\{ '\/theme\.js' \| url \}\}"/);
});

test("layout provides skip navigation to focusable main content", () => {
  assert.match(layout, /<a class="skip-link" href="#content">Skip to content<\/a>/);
  assert.match(layout, /<main id="content" tabindex="-1" class="max-w-page mx-auto">/);
  assert.match(styles, /\.skip-link:focus-visible\s*\{[^}]*position:\s*fixed;/s);
});

test("site uses Fira Mono as the default base font", () => {
  assert.match(layout, /Google Fonts: Fira Mono/);
  assert.match(layout, /family=Fira\+Mono:wght@400;500;700&display=swap/);
  assert.doesNotMatch(layout, /Inter/);

  assert.equal(
    getCustomProperty(styles, "@theme", "--font-sans").replace(/\s+/g, " "),
    '"Fira Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  );
  assert.match(styles, /body\s*\{[^}]*font-family:\s*var\(--font-sans\);/s);
  assert.match(styles, /body\s*\{[^}]*font-size-adjust:\s*from-font;/s);
});

test("theme controller applies persisted overrides and system fallback", () => {
  const source = fs.readFileSync("src/static/theme.js", "utf8");
  assert.match(source, /hidePopover/);
  assert.match(source, /addEventListener\("toggle"/);
  assert.match(source, /aria-pressed/);
  assert.doesNotMatch(source, /aria-checked/);
  assert.doesNotMatch(source, /menu\.hidden/);

  const context = createBrowserContext(true);

  vm.runInNewContext(source, context);

  const api = context.window.JulzTheme;
  assert.equal(typeof api.applyTheme, "function");

  api.applyTheme("dark");
  assert.equal(context.document.documentElement.dataset.theme, "dark");
  assert.equal(context.document.documentElement.style.colorScheme, "dark");
  assert.equal(context.localStorage.getItem("julzdesign-theme"), "dark");

  api.applyTheme("light");
  assert.equal(context.document.documentElement.dataset.theme, "light");
  assert.equal(context.document.documentElement.style.colorScheme, "light");
  assert.equal(context.localStorage.getItem("julzdesign-theme"), "light");

  api.applyTheme("system");
  assert.equal(context.document.documentElement.dataset.theme, undefined);
  assert.equal(context.document.documentElement.style.colorScheme, "dark");
  assert.equal(context.localStorage.getItem("julzdesign-theme"), "system");
});

test("dark mode keeps the same active nav color as light mode", () => {
  const baseNavActive = getCustomProperty(styles, ":root", "--nav-active-bg");

  assert.equal(baseNavActive, "#475569");
  assert.equal(
    getCustomProperty(styles, 'html[data-theme="dark"]', "--nav-active-bg"),
    undefined
  );
  assert.equal(
    getCustomProperty(styles, 'html:not([data-theme="light"])', "--nav-active-bg"),
    undefined
  );
});

test("main content opts into native page transitions", () => {
  assert.match(styles, /@view-transition\s*\{\s*navigation:\s*auto;\s*\}/);
  assert.match(styles, /--page-enter-distance:\s*2\.5rem;/);
  assert.match(styles, /--page-enter-duration:\s*320ms;/);
  assert.match(styles, /main\s*\{[^}]*view-transition-name:\s*page-content;/s);
  assert.match(
    styles,
    /::view-transition-new\(page-content\)\s*\{[^}]*animation:\s*page-content-in\s+var\(--page-enter-duration\)/s
  );
  assert.match(
    styles,
    /html\[data-page-motion="enter"\]\s+main\s*\{[^}]*animation:\s*page-content-in\s+var\(--page-enter-duration\)/s
  );
  assert.match(styles, /::view-transition-new\(root\)\s*\{[^}]*animation:\s*none;/s);
  assert.match(styles, /from\s*\{[^}]*transform:\s*translateY\(var\(--page-enter-distance\)\);/s);
  assert.match(layout, /addEventListener\("pagereveal"/);
  assert.match(layout, /event\.viewTransition/);
  assert.match(layout, /data-page-motion/);
  assert.match(
    styles,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*html\[data-page-motion="enter"\]\s+main[\s\S]*::view-transition-old\(page-content\)[\s\S]*::view-transition-new\(page-content\)[\s\S]*animation:\s*none;/
  );
});

test("case study media follows responsive and lazy-loading guidance", () => {
  assert.doesNotMatch(westrockPage, /deck1\.jp2/);
  assert.match(westrockPage, /\/img\/westrock\/deck1\.jpeg/);

  assert.doesNotMatch(prudentialPage, /<img\s+src="\.\.\/img\/pru\/cheatsheet\.png"/);
  assert.doesNotMatch(prudentialPage, /<img\s+src="\.\.\/img\/pru\/Integration\.png"/);
  assert.doesNotMatch(prudentialPage, /<img\s+src="\.\.\/img\/pru\/BackstopJS-Report-2\.png"/);
  assert.match(prudentialPage, /\{% image "\/img\/pru\/cheatsheet\.png"/);
  assert.match(prudentialPage, /\{% image "\/img\/pru\/Integration\.png"/);
  assert.match(prudentialPage, /\{% image "\/img\/pru\/BackstopJS-Report-2\.png"/);

  assert.match(
    westrockPage,
    /<iframe[^>]+title="WestRock design system promotional video"[^>]+loading="lazy"/
  );
  assert.match(
    prudentialPage,
    /<iframe[^>]+title="Pru-Workbench design system development video"[^>]+loading="lazy"/
  );
});

test("decorative home skill svgs are hidden from assistive technology", () => {
  assert.match(homePage, /<div class="skills[\s\S]*aria-hidden="true"[\s\S]*focusable="false"/);
  assert.equal((homePage.match(/<svg[^>]+aria-hidden="true"[^>]+focusable="false"/g) || []).length, 5);
});

function createBrowserContext(systemPrefersDark) {
  const documentElement = {
    dataset: {},
    style: {},
    setAttribute(name, value) {
      this[name] = value;
    },
    removeAttribute(name) {
      if (name === "data-theme") {
        delete this.dataset.theme;
      }
    },
  };

  return {
    window: {},
    document: {
      documentElement,
      addEventListener() {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
    localStorage: createLocalStorage(),
    matchMedia() {
      return {
        matches: systemPrefersDark,
        addEventListener() {},
      };
    },
  };
}

function createLocalStorage() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
}

function getCustomProperty(source, selector, property) {
  const blockMatch = source.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));
  if (!blockMatch) return undefined;

  const propertyMatch = blockMatch[1].match(
    new RegExp(`${escapeRegExp(property)}\\s*:\\s*([^;]+);`)
  );

  return propertyMatch ? propertyMatch[1].trim() : undefined;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
