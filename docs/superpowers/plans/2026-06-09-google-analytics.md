# Google Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-only, site-wide Google Analytics 4 pageview tracking for the portfolio using measurement ID `G-LRW1ZRSCCR`.

**Architecture:** Store the measurement ID in Eleventy global metadata, expose a dedicated global data file for build environment state, and conditionally render the standard `gtag.js` snippet from the shared Nunjucks layout. This keeps analytics centralized and avoids polluting GA with local development traffic.

**Tech Stack:** Eleventy 3, Nunjucks, global data files

---

### Task 1: Add Production-Aware Global Analytics Configuration

**Files:**
- Create: `src/_data/build.js`
- Modify: `src/_data/metadata.json`
- Modify: `src/_includes/default.njk`
- Verify: `_site/index.html`

- [ ] **Step 1: Add a global Eleventy data file for build environment state**

```js
module.exports = {
  isProduction: Boolean(process.env.ELEVENTY_PRODUCTION),
};
```

- [ ] **Step 2: Add the GA4 measurement ID to global metadata**

```json
{
  "title": "julzdesign",
  "description": "Design and development work by Julian K",
  "googleAnalyticsMeasurementId": "G-LRW1ZRSCCR"
}
```

- [ ] **Step 3: Render the standard GA4 snippet from the shared layout only for production builds**

```njk
{% if build.isProduction and metadata.googleAnalyticsMeasurementId %}
  <!-- Google Analytics -->
  <script
    async
    src="https://www.googletagmanager.com/gtag/js?id={{ metadata.googleAnalyticsMeasurementId }}"
  ></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "{{ metadata.googleAnalyticsMeasurementId }}");
  </script>
{% endif %}
```

- [ ] **Step 4: Run the production build to verify the site still compiles**

Run: `npm run build`
Expected: exit code `0` and generated files under `_site/`

- [ ] **Step 5: Verify the built HTML contains the GA4 script**

Run: `rg -n "G-LRW1ZRSCCR|googletagmanager" _site`
Expected: matches in generated HTML files from the shared layout
