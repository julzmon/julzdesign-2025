## Julzdesign Site

Eleventy + Tailwind v4 site using the Tailwind CLI (no PostCSS).

### Prerequisites
- Node.js 18+ recommended
- npm 9+

### Install
```
npm install
```

### Develop
Runs Eleventy dev server and Tailwind CLI in watch mode, outputting CSS to `_site/styles`.
```
npm run start
```
Visit the local URL Eleventy prints (usually `http://localhost:8080`).

### Build
Produces a production build with minified HTML and CSS.
```
npm run build
```

### Project Structure
- `src/` — Eleventy input (pages, includes, assets)
- `src/_includes/` — Layouts and partials
- `src/styles/` — Tailwind entry CSS (`site.css`)
- `_site/` — Generated output (ignored in git)

### Notes
- Tailwind v4 CLI builds CSS from `src/styles/site.css` and writes to `_site/styles/site.css`.
- In production (`npm run build`), HTML is minified via Eleventy transform.
