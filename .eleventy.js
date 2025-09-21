const fs = require("fs");
const path = require("path");
const { minify: htmlMinify } = require("html-minifier-terser");
const Image = require("@11ty/eleventy-img");


module.exports = function(eleventyConfig) {

  if (process.env.ELEVENTY_PRODUCTION) {
    eleventyConfig.addTransform("htmlmin", htmlminTransform);
  }

  // Passthrough
  eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy("src/img");

  // Watch targets
  eleventyConfig.addWatchTarget("./src/styles/");
  eleventyConfig.addWatchTarget("./tailwind.config.js");

  // Simple HTML escape for captions/descriptions
  const escapeHtml = (str = "") => String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  // Responsive image shortcode using @11ty/eleventy-img
  // Usage in Nunjucks: {% image "/img/westrock/figma.png", "Figma screenshot", { widths: [600, 1200] } %}
  async function imageShortcode(src, alt = "", opts = {}) {
    if (!src) throw new Error("image shortcode: missing src");
    if (alt === undefined) throw new Error(`Missing \'alt\' for image: ${src}`);

    const widths = opts.widths || [400, 800, 1200];
    const formats = opts.formats || ["avif", "webp", "jpeg"];
    const sizes = opts.sizes || "100vw";
    const description = opts.description || opts.caption; // optional description/caption
    const figureClass = opts.figureClass || "";
    const figcaptionClass = opts.figcaptionClass || "text-sm text-gray-600 mt-2";

    // Resolve local paths from ./src
    const isRemote = /^(https?:)?\/\//.test(src);
    const inputPath = isRemote ? src : path.join("./src", src.replace(/^\//, ""));

    // Fallback for unsupported source formats (e.g., .jp2)
    const unsupportedExts = new Set([".jp2", ".heic", ".heif", ".bmp"]);
    const ext = path.extname(src || "").toLowerCase();
    const fallbackImg = () => {
      // Return a direct <img>, passthrough will copy assets from src/img
      const imgHtml = `<img src="${src}" alt="${alt ? escapeHtml(alt) : ""}" loading="lazy" decoding="async">`;
      if (description) {
        return `<figure class="${escapeHtml(figureClass)}">${imgHtml}<figcaption class="${escapeHtml(figcaptionClass)}">${escapeHtml(description)}</figcaption></figure>`;
      }
      return imgHtml;
    };

    if (!isRemote && unsupportedExts.has(ext)) {
      return fallbackImg();
    }

    try {
      const metadata = await Image(inputPath, {
        widths,
        formats,
        urlPath: "/img/optimized/",
        outputDir: "./_site/img/optimized/",
      });

      const pictureHtml = Image.generateHTML(metadata, {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
      });
      if (description) {
        return `<figure class="${escapeHtml(figureClass)}">${pictureHtml}<figcaption class="${escapeHtml(figcaptionClass)}">${escapeHtml(description)}</figcaption></figure>`;
      }
      return pictureHtml;
    } catch (err) {
      // Graceful fallback on any processing error
      console.warn(`[eleventy-img] Falling back to <img> for ${src}:`, err.message);
      return fallbackImg();
    }
  }

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", (src, alt, opts) => imageShortcode(src, alt, opts));
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  return {
    dir: {
      input: "src"
    }
  }
};

function htmlminTransform(content, outputPath) {
  if( outputPath.endsWith(".html") ) {
    let minified = htmlMinify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}
