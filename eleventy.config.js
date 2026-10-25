const fs = require("fs");

module.exports = function (eleventyConfig) {
  // Existing hand-built homepage and assets are copied as-is.
  eleventyConfig.addPassthroughCopy({
    "mistyvillas.in/index.html": "index.html",
    "mistyvillas.in/styles.css": "styles.css",
    "mistyvillas.in/script.js": "script.js",
    "mistyvillas.in/data.json": "data.json",
    "mistyvillas.in/images": "images",
  });

  // Contact details come from data.json, so editing them in the CMS updates every page.
  eleventyConfig.addGlobalData("site", () =>
    JSON.parse(fs.readFileSync("mistyvillas.in/data.json", "utf8")).site
  );

  // Lowest room price, used by the "Misty Villas" promo block on guides.
  eleventyConfig.addGlobalData("lowest_price", () => {
    const rooms = JSON.parse(fs.readFileSync("mistyvillas.in/data.json", "utf8")).rooms || [];
    const prices = rooms.map((r) => Number(r.price)).filter(Boolean);
    return prices.length ? Math.min(...prices) : null;
  });

  // Pages marked "Draft" in the CMS are left out of the live build.
  eleventyConfig.addPreprocessor("drafts", "md", (data) => {
    if (data.draft) return false;
  });

  // When hosted under a sub-path (github.io/Misty-Villas/), prefix root-relative links.
  const prefix = (process.env.PATH_PREFIX || "").replace(/\/$/, "");
  eleventyConfig.addTransform("pathPrefix", function (content) {
    if (!prefix || !(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/(href|src)="\/(?!\/)/g, `$1="${prefix}/`);
  });

  eleventyConfig.addFilter("dateDisplay", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
  );
  eleventyConfig.addFilter("monthYear", (d) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
  );
  eleventyConfig.addFilter("rupee", (n) => "\u20B9" + Number(n).toLocaleString("en-IN"));
  eleventyConfig.addFilter("paras", (s) =>
    String(s || "").split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
  );
  eleventyConfig.addFilter("dateIso", (d) => new Date(d).toISOString().slice(0, 10));

  return {
    dir: { input: "mistyvillas.in", output: "_site", includes: "_includes" },
    templateFormats: ["md", "njk"],
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
  };
};
