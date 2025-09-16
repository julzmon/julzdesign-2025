const fs = require("fs");
const path = require("path");
const htmlmin = require("html-minifier");
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

  // Responsive image shortcode using @11ty/eleventy-img
  // Usage in Nunjucks: {% image "/img/westrock/figma.png", "Figma screenshot", { widths: [600, 1200] } %}
  async function imageShortcode(src, alt = "", opts = {}) {
    if (!src) throw new Error("image shortcode: missing src");
    if (alt === undefined) throw new Error(`Missing \'alt\' for image: ${src}`);

    const widths = opts.widths || [400, 800, 1200];
    const formats = opts.formats || ["avif", "webp", "jpeg"];
    const sizes = opts.sizes || "100vw";

    // Resolve local paths from ./src
    const isRemote = /^(https?:)?\/\//.test(src);
    const inputPath = isRemote ? src : path.join("./src", src.replace(/^\//, ""));

    const metadata = await Image(inputPath, {
      widths,
      formats,
      urlPath: "/img/optimized/",
      outputDir: "./_site/img/optimized/",
    });

    return Image.generateHTML(metadata, {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    });
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
    let minified = htmlmin.minify(content, {
      useShortDoctype: true,
      removeComments: true,
      collapseWhitespace: true
    });
    return minified;
  }
  return content;
}
